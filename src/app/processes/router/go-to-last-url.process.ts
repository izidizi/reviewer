import { GoToLastUrlProcess, GoToProcess } from '.';
import { logDebug } from '../../../services/debug-logger';
import { createPath, parsePath } from '../../model/path';
import { AppRouterStore } from '../../store/app-router/app-router.store';

const process = 'GoToLastUrlProcess';
export function goToLastUrlProcess({
  appRouterStore,
  goToProcess,
}: {
  appRouterStore: AppRouterStore;
  goToProcess: GoToProcess;
}): GoToLastUrlProcess {
  return async () => {
    logDebug(`${process} - start`, { includeStack: true });

    const path = parsePath(appRouterStore.lastUrl() ?? '');
    if (path.length === 0) {
      logDebug(`${process} - early exit, not last url`);
      return false;
    }
    logDebug(`${process} - navigating`, { entity: createPath(path) });
    await goToProcess(path);

    logDebug(`${process} - finish`);
    return true;
  };
}
