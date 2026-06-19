import { inject, InjectionToken } from '@angular/core';
import { ProcessError } from '../../model/error/process-error';
import { DriveApiService, DriveApiAuthenticationError } from '../../services/drive-api';
import { CheckAuthBL } from '../process-bl';
import { logDebug, logError } from '../../services/debug-logger';
import { AuthStore } from '../store/auth/auth.store';

export class StaleAuthorisationTokenError extends ProcessError {
  constructor() {
    super({ process, message: 'authorization token is no longer valid' });
  }
}

const process = 'TestAuthProcess';
export type TestAuthProcess = () => Promise<void>;
export const TestAuthProcess = new InjectionToken<TestAuthProcess>(process, {
  providedIn: 'root',
  factory: () => {
    const driveApi = inject(DriveApiService);
    const checkAuth = inject(CheckAuthBL);
    const authStore = inject(AuthStore);

    return testAuthProcess({ driveApi, checkAuth, authStore });
  },
});

function testAuthProcess({
  checkAuth,
  driveApi,
  authStore,
}: {
  checkAuth: CheckAuthBL;
  driveApi: DriveApiService;
  authStore: AuthStore;
}): TestAuthProcess {
  return async () => {
    logDebug(`${process} - start`, { includeStack: true });

    const accessToken = await checkAuth();

    logDebug(`${process} - token checking`);
    await driveApi.listFiles(accessToken, 'root').catch((error): never => {
      if (error instanceof DriveApiAuthenticationError) {
        logError(error, `${process} - token check failed`);
        authStore.accessTokenReset();
        throw new StaleAuthorisationTokenError();
      }

      throw error;
    });

    logDebug(`${process} - finish`);
  };
}
