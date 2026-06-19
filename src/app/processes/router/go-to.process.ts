import { Router } from '@angular/router';
import { GoToProcess } from '.';
import { AppRouterStore } from '../../store/app-router/app-router.store';
import { logDebug, logError } from '../../../services/debug-logger';

const process = 'GoToProcess';
export function goToProcess({
  appRouterStore,
  router,
}: {
  appRouterStore: AppRouterStore;
  router: Router;
}): GoToProcess {
  return async (route: readonly string[]) => {
    logDebug(`${process} - start`, { entity: `/${route.join('/')}`, includeStack: true });
    const path = route.join('/');

    appRouterStore.patchLastUrl(path);

    const result = await router.navigate(route).catch((error) => {
      logError(error, process, `/${path}`);
    });

    if (result) {
      logDebug(`${process} - navigation complete`, { entity: `/${path}` });
    } else {
      logDebug(`${process} - navigation failed`, { entity: `/${path}` });
    }
  };
}
