export type DebugLogRecord = {
  timestamp: number;
  severity: 'debug' | 'info' | 'warning' | 'error';
  object: string | null;
  place: string;
  entity?: string;
  message?: string;
  stack?: StackRecord[] | null;
  payload?: Error | unknown;
};

export type StackRecord = {
  raw: string;
  browser?: string;
  functionName?: string | null;
  file?: string;
  line?: number;
  column?: number;
};

const logRecords: DebugLogRecord[] = [];

export function clearLog() {
  logRecords.length = 0;
}

export function logDebug(
  place: string,
  {
    entity,
    payload,
    includeStack,
  }: Pick<DebugLogRecord, 'entity' | 'payload'> & { includeStack?: true } = {
    entity: undefined,
    payload: undefined,
  },
) {
  log({ severity: 'debug', place, entity, payload, includeStack });
}
export function logInfo(
  message: string,
  place: string,
  { entity, payload }: Pick<DebugLogRecord, 'entity' | 'payload'>,
) {
  log({ severity: 'info', place, entity, message, payload });
}
export function logWarning(
  message: string,
  place: string,
  { entity, payload }: Pick<DebugLogRecord, 'entity' | 'payload'>,
) {
  log({ severity: 'warning', place, entity, message, payload });
}
export function logError(error: unknown, place: string, entity?: string) {
  const message = error instanceof Error ? error.message : String(error);
  log({ severity: 'error', place, entity, message, payload: error, includeStack: true });
}
export function logAction(
  title: string,
  place: string,
  { entity, payload }: { entity?: string; payload?: unknown } = {
    entity: undefined,
    payload: undefined,
  },
) {
  logInfo(`👆 - ${title}`, place, { entity, payload });
}

export function logToConsole(
  {
    startIndex,
    entityContains,
    excludeSeverity,
    aroundIndex,
    aroundIndexCount,
    mode,
  }: {
    startIndex?: number;
    excludeSeverity?: string;
    entityContains?: string;
    aroundIndex?: number[];
    aroundIndexCount?: number;
    mode: 'brief' | 'extended' | 'full';
  } = { mode: 'brief' },
) {
  startIndex = startIndex ?? 0;
  aroundIndexCount = aroundIndex ? (aroundIndexCount ?? 10) : logRecords.length;
  aroundIndex = aroundIndex ?? [0];

  for (const aroundIndexItem of aroundIndex ?? []) {
    const firstIndex = Math.max(
      aroundIndexItem - (aroundIndexCount === 1 ? 0 : aroundIndexCount),
      startIndex,
    );
    let firstIndexTS = logRecords[firstIndex]?.timestamp ?? 0;
    console.log('');
    console.log('');
    console.log(` index #${firstIndex}`);
    console.log('-----------');
    for (
      let recordIndex = firstIndex;
      recordIndex < aroundIndexItem + aroundIndexCount;
      recordIndex++
    ) {
      if (recordIndex < (startIndex ?? 0)) continue;
      const record = logRecords[recordIndex];

      if (!record) continue;
      if (entityContains) {
        if (!record.entity) continue;
        if (!record.entity.includes(entityContains)) continue;
      }

      if (excludeSeverity && record.severity.includes(excludeSeverity)) continue;

      if (record.timestamp - firstIndexTS > 10 * 1000) {
        firstIndexTS = record.timestamp;
      }

      const dTS =
        record.timestamp === firstIndexTS
          ? '=0000.000'
          : `+${(record.timestamp - firstIndexTS).toFixed(3).padStart(8, '0')}`;
      const dTSFormatted = `${dTS.slice(0, 2)} ${dTS.slice(2)}`;

      const rP = '          | ';
      const color =
        record.severity === 'debug'
          ? 'grey'
          : record.severity === 'info'
            ? 'black'
            : record.severity === 'warning'
              ? 'orange'
              : 'red';

      if (mode === 'brief') {
        const briefAddtionalInfo = record.message
          ? `(M:${record.message})`
          : record.entity
            ? `(E:${record.entity})`
            : '';
        console.log(
          `%c${dTSFormatted}| %c[#${recordIndex.toString().padStart(3, '0')}] %c${record.place} %c${briefAddtionalInfo}`,
          'color: blue',
          'color: black;font-weight:bold;',
          `color: ${color}`,
          `color: ${color};font-style: italic;`,
        );
      }

      if (mode === 'extended' || mode === 'full') {
        console.log(
          `%c${dTSFormatted}| %c[#${recordIndex.toString().padStart(3, '0')}] %c${record.place}`,
          'color: blue',
          'color: black;font-weight:bold;',
          `color: ${color}`,
        );
        console.log(
          `${rP}message: %c${record.message ?? '[no message]'}`,
          `color: ${color};font-style: italic`,
        );
      }

      if (mode === 'full') {
        console.log(
          `${rP}entity: %c${record.entity ?? '[no entity]'}`,
          `color: ${color};font-style: italic`,
        );
        console.log(rP, record.payload);
        console.log('');
      }
    }
  }

  return 'end of the log';
}

function log({
  severity,
  place,
  entity,
  message,
  payload,
  includeStack,
}: Pick<DebugLogRecord, 'severity' | 'place' | 'entity' | 'message' | 'payload'> & {
  includeStack?: true;
}) {
  const { object, stack } = getCallPlace();
  const record: DebugLogRecord = {
    timestamp: performance.timeOrigin + performance.now(),
    severity,
    object,
    place,
    message,
  };
  if (entity) record.entity = entity;
  if (payload) record.payload = payload;
  if (includeStack) record.stack = stack;
  logRecords.push(record);
}

function getCallPlace(): {
  object: string | null;
  stack: StackRecord[] | null;
} {
  const callStack = new Error().stack;

  if (!callStack) {
    return { object: null, stack: null };
  }

  const lines = callStack.split('\n').map((line) => line.trim());
  const skipFrames = lines.findIndex((text) => text.includes('getCallPlace')) + 3;
  lines.splice(0, skipFrames);

  if (lines.length === 0) return { object: null, stack: [] };

  const stack = lines.map((line) => parseCallStackLine(line));
  const parts = (stack[0].functionName ?? '').split('.');

  return {
    object: parts.length > 1 ? parts[0] : null,
    stack,
  };
}

function parseCallStackLine(text: string): StackRecord {
  // Chrome / Edge
  let match = text.match(/at\s+(.*?)\s+\((.*?):(\d+):(\d+)\)$/);

  if (match) {
    return {
      raw: text,
      browser: 'chromium',
      functionName: match[1],
      file: match[2],
      line: Number(match[3]),
      column: Number(match[4]),
    };
  }

  // Chrome anonymous function
  match = text.match(/at\s+(.*?):(\d+):(\d+)$/);

  if (match) {
    return {
      raw: text,
      browser: 'chromium',
      functionName: null,
      file: match[1],
      line: Number(match[2]),
      column: Number(match[3]),
    };
  }

  // Firefox / Safari
  match = text.match(/(.*?)@(.*?):(\d+):(\d+)$/);

  if (match) {
    return {
      raw: text,
      browser: 'gecko-webkit',
      functionName: match[1] || null,
      file: match[2],
      line: Number(match[3]),
      column: Number(match[4]),
    };
  }

  return {
    raw: text,
  };
}

type GlobalLogger = {
  logToConsole: () => void;
  logToConsoleBrief: (fromIndex?: number, count?: number) => void;
  logToConsoleRecord: (recordIndex: number) => void;
};
const safeWindow = (globalThis ?? window) as unknown as GlobalLogger;
safeWindow.logToConsole = logToConsole;
safeWindow.logToConsoleBrief = (fromIndex, count) => {
  if (fromIndex && count) {
    const aroundIndex = fromIndex + Math.ceil(count / 2);
    const aroundIndexCount = Math.ceil(count / 2);
    return logToConsole({ mode: 'brief', aroundIndex: [aroundIndex], aroundIndexCount });
  } else {
    return logToConsole({ mode: 'brief' });
  }
};
safeWindow.logToConsoleRecord = (index) => {
  return logToConsole({ mode: 'full', aroundIndex: [index], aroundIndexCount: 1 });
};
