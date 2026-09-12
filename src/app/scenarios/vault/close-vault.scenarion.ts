import { logDebug } from '../../../services/debug-logger';
import { ProcessError } from '../../../model/error/process-error';
import { CloseVaultScenario } from '.';
import { Router } from '@angular/router';
import { AppRouterStore } from '../../store/app-router/app-router.store';

export class IndexVaultAllScenarioNotImplementedError extends ProcessError {
  constructor() {
    super({ process, message: `indexing mode "ALL" is not impelented` });
  }
}

const process = 'CloseVaultScenario';
export function closeVaultScenario({
  router,
  routerStore,
}: {
  router: Router;
  routerStore: AppRouterStore;
}): CloseVaultScenario {
  return async () => {
    logDebug(`${process} - start`, { includeStack: true });

    routerStore.patchLastUrl('index');
    routerStore.patchVault('');

    const uri = globalThis.location.origin;
    globalThis.location.href = uri + '?t=' + new Date().getTime().toString();

    logDebug(`${process} - finish`, { includeStack: true });
  };
}
