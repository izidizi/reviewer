import { GetDirectoryDriveIdProcess, GetFileDriveIdProcess } from '.';
import { ProcessError } from '../../../model/error/process-error';
import { DriveApiService } from '../../../services/drive-api';
import { logDebug, logError } from '../../../services/debug-logger';
import { getDriveId } from '../../model/drive-id';
import { createPath, Path } from '../../model/path';

export class FileNotFoundError extends ProcessError {
  constructor(path: Path, fileName: string) {
    super({
      process,
      message: `file '${createPath(path)}/${fileName}' not found`,
    });
  }
}

const process = 'GetFileDriveIdProcess';
export function getFileDriveIdProcess({
  driveApi,
  getDirectoryDriveIdProcess,
}: {
  driveApi: DriveApiService;
  getDirectoryDriveIdProcess: GetDirectoryDriveIdProcess;
}): GetFileDriveIdProcess {
  return async (accessToken, path, file) => {
    logDebug(`${process} - start`, { includeStack: true });

    const directoryDriveId = await getDirectoryDriveIdProcess(accessToken, path);

    const { files } = await driveApi
      .listFiles(accessToken, directoryDriveId)
      .catch((error): never => {
        logError(error, `${process} - failed to list files`, `dir: ${path.join('/')}`);

        // abort
        throw new FileNotFoundError(path, file);
      });
    const driveFile = files.find(
      ({ mimeType, name }) => mimeType === 'application/zip' && name === file,
    );

    if (!driveFile) {
      throw new FileNotFoundError(path, file);
    }

    logDebug(`${process} - finish`, { includeStack: true });

    return {
      directoryDriveId,
      fileDriveId: getDriveId(driveFile.id),
    };
  };
}
