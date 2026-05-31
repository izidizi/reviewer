import { inject, InjectionToken } from '@angular/core';
import { DriveApiService } from '../../services/drive-api/drive-api.service';
import { LogoutProcess } from './logout.process';
import { DriveApiAuthenticationError } from '../../services/drive-api/drive-api-errors';
import { CheckAuthProcess } from './check-auth.process';
import { DriveFileCapabilities } from '../../services/drive-api/get-file-capabilities';

export type GetFileCapabilitiesProcess = (id: string) => Promise<DriveFileCapabilities>;
export const GetFileCapabilitiesProcess = new InjectionToken<GetFileCapabilitiesProcess>(
  'GetFileCapabilitiesProcess',
  {
    providedIn: 'root',
    factory: () => {
      const driveApi = inject(DriveApiService);
      const logoutProcess = inject(LogoutProcess);
      const checkAuthProcess = inject(CheckAuthProcess);

      return getFileCapabilitiesProcess({ driveApi, logoutProcess, checkAuthProcess });
    },
  },
);

function getFileCapabilitiesProcess({
  driveApi,
  logoutProcess,
  checkAuthProcess,
}: {
  driveApi: DriveApiService;
  logoutProcess: LogoutProcess;
  checkAuthProcess: CheckAuthProcess;
}): GetFileCapabilitiesProcess {
  return async (id) => {
    const accessToken = await checkAuthProcess();

    try {
      return driveApi.getFileCapabilities(accessToken, id);
    } catch (error) {
      if (error instanceof DriveApiAuthenticationError) {
        await logoutProcess();
      }

      throw error;
    }
  };
}
