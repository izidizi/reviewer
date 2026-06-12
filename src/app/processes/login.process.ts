import { inject, InjectionToken } from '@angular/core';
import { AuthStore } from '../store/auth/auth.store';
import { DriveApiService } from '../../services/drive-api/drive-api.service';
import { logDebug, logError } from '../../services/debug-logger';
import { ProcessError } from '../../model/error/process-error';

export class UnableToLogUserInError extends ProcessError {
  constructor() {
    super({
      process,
      message: `unable to log the user in`,
    });
  }
}

export type LoginProcess = () => Promise<void>;
export const LoginProcess = new InjectionToken<LoginProcess>('LoginProcess', {
  providedIn: 'root',
  factory: () => {
    const authStore = inject(AuthStore);
    const driveApi = inject(DriveApiService);

    return loginProcess({ authStore, driveApi });
  },
});

const process = 'LoginProcess';
function loginProcess({
  authStore,
  driveApi,
}: {
  authStore: AuthStore;
  driveApi: DriveApiService;
}): LoginProcess {
  return async () => {
    logDebug(`${process} - start`, { includeStack: true });

    if (authStore.isAuthed()) {
      logDebug(`${process} - already logged-in, exit`);
      return;
    }

    if (authStore.isPending()) {
      logDebug(`${process} - in process, exit`);
      return;
    }

    authStore.startLoading();

    if (!driveApi.isScriptReady) {
      await driveApi.initScript().catch((error) => {
        logError(error, `${process}/init script`);
        authStore.loadFailed(error as Error);
        throw new UnableToLogUserInError();
      });
    }

    if (!driveApi.isClientReady) {
      try {
        driveApi.initClient();
      } catch (error) {
        logError(error, `${process}/init script`);
        authStore.loadFailed(error as Error);
        throw new UnableToLogUserInError();
      }
    }

    const token = await driveApi.requestAccessToken().catch((error) => {
      logError(error, `${process} - token request`);
      authStore.loadFailed(error);
    });

    if (token) authStore.accessTokenIsReady(token);
  };
}
