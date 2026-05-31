import { inject, InjectionToken } from '@angular/core';
import { AuthStore } from '../store/auth/auth.store';
import { DriveApiService } from '../../services/drive-api/drive-api.service';

export type LogoutProcess = () => Promise<void>;
export const LogoutProcess = new InjectionToken<LogoutProcess>('LogoutProcess', {
  providedIn: 'root',
  factory: () => {
    const authStore = inject(AuthStore);
    const driveApi = inject(DriveApiService);

    return logoutProcess({ authStore, driveApi });
  },
});

function logoutProcess({
  authStore,
  driveApi,
}: {
  authStore: AuthStore;
  driveApi: DriveApiService;
}): LogoutProcess {
  return async () => {
    authStore.accessTokenReset();
  };
}
