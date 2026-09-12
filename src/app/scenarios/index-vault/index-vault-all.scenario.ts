import { DriveApiService } from '../../../services/drive-api/drive-api.service';
import { ConfigurationStore } from '../../store/configuration/configuration.store';
import { DecisionTableService } from '../../../services/decision-table.service';
import { logDebug } from '../../../services/debug-logger';
import { CheckAuthBL } from '../../process-bl';
import { IndexVaultAllScenario } from '.';
import { GetDirectoryDriveIdProcess } from '../../processes/drive';
import { VaultStore } from '../../store/vault/vault.store';
import { VaultStateStore } from '../../store/vault-state/vault-state.store';
import { IndexVaultStore } from './index-vault.store';
import { ParseArticleLogic } from '../../process-bl/parse-article';
import { ProcessError } from '../../../model/error/process-error';

export class IndexVaultAllScenarioNotImplementedError extends ProcessError {
  constructor() {
    super({ process, message: `indexing mode "ALL" is not impelented` });
  }
}

const process = 'IndexVaultAllScenario';
export function indexVaultAllScenario({
  driveApi,
  decisionService,
  indexVaultStore,
  vaultStore,
  vaultStateStore,
  configurationStore,
  checkAuthLogic,
  getDirectoryDriveIdProcess,
  parseArticleLogic,
}: {
  driveApi: DriveApiService;
  decisionService: DecisionTableService;
  indexVaultStore: IndexVaultStore;
  vaultStore: VaultStore;
  vaultStateStore: VaultStateStore;
  configurationStore: ConfigurationStore;
  checkAuthLogic: CheckAuthBL;
  getDirectoryDriveIdProcess: GetDirectoryDriveIdProcess;
  parseArticleLogic: ParseArticleLogic;
}): IndexVaultAllScenario {
  return async ({}) => {
    logDebug(`${process} - start`, { includeStack: true });

    throw new IndexVaultAllScenarioNotImplementedError();

    logDebug(`${process} - finish`, { includeStack: true });
  };
}
