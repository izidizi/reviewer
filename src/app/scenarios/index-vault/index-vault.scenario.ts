import { logDebug } from '../../../services/debug-logger';
import { IndexVaultMissingProcess, IndexVaultScenario } from '.';
import { ProcessError } from '../../../model/error/process-error';

export class IndexVaultScenarioNotImplementedError extends ProcessError {
  constructor(mode: string) {
    super({ process, message: `indexing mode "${mode}" not impelented` });
  }
}

const process = 'IndexVaultScenario';
export function indexVaultScenario({
  indexVaultMissingProcess,
}: {
  indexVaultMissingProcess: IndexVaultMissingProcess;
}): IndexVaultScenario {
  return async ({ mode, reindexArticlesWithInvalidIndexDate, reindexArticlesOlderThan }) => {
    logDebug(`${process} - start`, { includeStack: true });

    if (mode === 'missing') {
      await indexVaultMissingProcess({
        reindexArticlesWithInvalidIndexDate,
        reindexArticlesOlderThan,
      });
    } else if (mode === 'all') {
      throw new IndexVaultScenarioNotImplementedError(mode);
    } else {
      throw new IndexVaultScenarioNotImplementedError(`article`);
    }

    logDebug(`${process} - finish`, { includeStack: true });
  };
}
