import { GoToProcess, LoadDefaultVaultProcess } from '.';
import { logDebug, logError } from '../../../services/debug-logger';
import { parsePath } from '../../model/path';
import { AppRouterStore } from '../../store/app-router/app-router.store';
import { LoadConfigurationProcess } from '../load-configuration.process';

const process = 'LoadDefaultVaultProcess';
export function loadDefaultVaultProcess({
  appRouterStore,
  loadConfiguration,
  goto,
}: {
  appRouterStore: AppRouterStore;
  loadConfiguration: LoadConfigurationProcess;
  goto: GoToProcess;
}): LoadDefaultVaultProcess {
  return async () => {
    logDebug(`${process} - start`, { includeStack: true });

    const vault = appRouterStore.vault();
    if (!vault) {
      logDebug(`${process} - early exit, no default vault`);
      return;
    }

    const vaultFileName = 'vault.zip';
    let lastUrl: string | null = null;
    await loadConfiguration(parsePath(vault), vaultFileName)
      .then(() => (lastUrl = appRouterStore.lastUrl()))
      .catch((error) => {
        logError(error, process, `${vault}/${vaultFileName}`);
      });

    if (lastUrl) {
      goto(parsePath(lastUrl));
    } else {
      goto(['plan']);
    }

    logDebug(`${process} - finish`);
  };
}
