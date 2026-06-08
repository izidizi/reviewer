import { DriveApiService } from '../../../services/drive-api/drive-api.service';
import { Path } from '../../model/path';
import { ProcessError, ProcessUnhandledError } from '../../../model/error/process-error';
import { GetDirectoryDriveIdProcess } from '.';
import { getDriveId } from '../../model/drive-id';
import { ConfigurationStore } from '../../store/configuration/configuration.store';
import { logDebug, logError } from '../../../services/debug-logger';
import { ListFilesResponse } from '../../../services/drive-api/list-files.method';

export class DirectoryNotFound extends ProcessError {
  constructor(path: Path) {
    super({
      process: 'GetDirectoryDriveIdProcess',
      message: `path ${path.join('/')} not found`,
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

    for (const pathItem of path) {
      logDebug(`${process} - list dir`, { entity: pathItem, payload: { pathItem, rootId } });
      const { files } = (await driveApi
        .listFiles(accessToken, rootId ?? 'root')
        .catch((error): never => {
          logError(error, `${process} - failed to list files`, `dir: ${rootId}`);

          // abort
          throw new ProcessUnhandledError({ process, cause: error });
        })) as ListFilesResponse;

      rootId =
        files.find(
          ({ mimeType, name }) =>
            mimeType === 'application/vnd.google-apps.folder' && name === pathItem,
        )?.id ?? null;

      if (rootId === null) break;
    }

    // abort
    if (rootId === null) throw new DirectoryNotFound(path);

    logDebug(`${process} - finish`);
    return getDriveId(rootId);
  };
}
