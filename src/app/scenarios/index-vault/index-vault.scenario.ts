import { logDebug } from '../../../services/debug-logger';
import { IndexVaultAllScenario, IndexVaultMissingProcess, IndexVaultScenario } from '.';
import { ProcessError } from '../../../model/error/process-error';

export class IndexVaultScenarioNotImplementedError extends ProcessError {
  constructor(mode: string) {
    super({ process, message: `indexing mode "${mode}" not impelented` });
  }
}

const process = 'IndexVaultScenario';
export function indexVaultScenario({
  indexVaultMissingProcess,
  indexVaultAllScenario,
}: {
  indexVaultMissingProcess: IndexVaultMissingProcess;
  indexVaultAllScenario: IndexVaultAllScenario;
}): IndexVaultScenario {
  return async ({ mode, reindexArticlesWithInvalidIndexDate, reindexArticlesOlderThan }) => {
    logDebug(`${process} - start`, { includeStack: true });

    if (mode === 'missing') {
      await indexVaultMissingProcess({
        reindexArticlesWithInvalidIndexDate,
        reindexArticlesOlderThan,
      });
    } else if (mode === 'all') {
      await indexVaultAllScenario({});
    } else {
      throw new IndexVaultScenarioNotImplementedError(`article`);
    }

    logDebug(`${process} - finish`, { includeStack: true });
  };
}
