import { inject, InjectionToken } from '@angular/core';
import { AuthStore } from '../store/auth/auth.store';
import { DriveApiService } from '../../services/drive-api/drive-api.service';

export type LoginProcess = () => Promise<void>;
export const LoginProcess = new InjectionToken<LoginProcess>('LoginProcess', {
  providedIn: 'root',
  factory: () => {
    const authStore = inject(AuthStore);
    const driveApi = inject(DriveApiService);

    return loginProcess({ authStore, driveApi });
  },
});

function loginProcess({
  authStore,
  driveApi,
}: {
  authStore: AuthStore;
  driveApi: DriveApiService;
}): LoginProcess {
  return async () => {
    if (authStore.isAuthed()) return;

    if (authStore.isPending()) return;

    authStore.startLoading();

    if (!driveApi.isScriptReady) {
      await driveApi.initScript();
    }

    if (!driveApi.isClientReady) {
      driveApi.initClient();
    }

    const token = await driveApi.requestAccessToken().catch((error) => {
      authStore.loadFailed(error);
    });

    if (token) authStore.accessTokenIsReady(token);
  };
}
