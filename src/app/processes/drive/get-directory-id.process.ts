import { DriveApiService } from '../../../services/drive-api/drive-api.service';
import { ProcessError } from '../../../model/error/process-error';
import { GetDirectoryDriveIdProcess } from '.';
import { getDriveId } from '../../model/drive-id';
import { ConfigurationStore } from '../../store/configuration/configuration.store';
import { logDebug, logError } from '../../../services/debug-logger';
import { ListFilesResponse } from '../../../services/drive-api/list-files.method';
import { DriveApiAuthenticationError } from '../../../services/drive-api/drive-api-errors';
import { UserNotAuthorised } from '../../process-bl';

export class DirectoryNotFound extends ProcessError {
  constructor(path: string) {
    super({
      process,
      message: `path ${path} not found`,
    });
  }
}

const process = 'GetDirectoryDriveIdProcess';
export function getDirectoryDriveId({
  driveApi,
  configurationStore,
}: {
  driveApi: DriveApiService;
  configurationStore: ConfigurationStore;
}): GetDirectoryDriveIdProcess {
  return async (accessToken, path) => {
    logDebug(`${process} - start`, { includeStack: true });

    let rootId: string | null = configurationStore.vaultRootPathDriveId() ?? 'root';
    let currentPath: string = '';

    for (const pathItem of path) {
      currentPath += pathItem;
      logDebug(`${process} - list dir`, { entity: currentPath, payload: { currentPath, rootId } });
      const { files } = (await driveApi
        .listFiles(accessToken, rootId ?? 'root')
        .catch((error): never => {
          logError(error, `${process} - failed to list files`, `dir: ${rootId}`);
          if (error instanceof DriveApiAuthenticationError) {
            // abort the process
            throw new UserNotAuthorised();
          }

          // abort the process
          throw new DirectoryNotFound(currentPath);
        })) as ListFilesResponse;

      rootId =
        files.find(
          ({ mimeType, name }) =>
            mimeType === 'application/vnd.google-apps.folder' && name === pathItem,
        )?.id ?? null;

      if (rootId === null) break;
    }

    // abort
    if (rootId === null) throw new DirectoryNotFound(currentPath);

    logDebug(`${process} - finish`);
    return getDriveId(rootId);
  };
}
