import { DriveApiService } from '../../../services/drive-api/drive-api.service';
import {
  DriveApiAuthenticationError,
  DriveApiFileNotFoundError,
  DriveApiUnexpectedAnswerError,
} from '../../../services/drive-api/drive-api-errors';
import { Path } from '../../model/path';
import { ProcessUnhandledError } from '../../../model/error/process-error';
import { ConfigurationStore } from '../../store/configuration/configuration.store';
import { VaultIndexSlice } from '../../store/vault-index/vault-index.slice';
import { ArticleService } from '../../../services/article/article.service';
import { VaultIndexStore } from '../../store/vault-index/vault-index.store';
import { GetDirectoryDriveIdProcess, VaultIndexAllProcess } from '.';
import { CheckAuthBL, UserNotAuthorised } from '../../process-bl';
import { logError, logWarning } from '../../../services/debug-logger';

const process = 'VaultIndexAllProcess';
export function vaultIndexAllProcess({
  driveApi,
  articleService,
  configurationStore,
  vaultIndexStore,
  checkAuth,
  getDirectoryDriveIdProcess,
}: {
  driveApi: DriveApiService;
  articleService: ArticleService;
  configurationStore: ConfigurationStore;
  vaultIndexStore: VaultIndexStore;
  checkAuth: CheckAuthBL;
  getDirectoryDriveIdProcess: GetDirectoryDriveIdProcess;
}): VaultIndexAllProcess {
  return async () => {
    const accessToken = await checkAuth();

    vaultIndexStore.startVaultIndex({ mode: 'all', started: new Date() });

    const path: Path = configurationStore.path();
    const startDriveID = await getDirectoryDriveIdProcess(accessToken, path);

    const foldersToRead: { id: string; path: string }[] = [{ id: startDriveID, path: '' }];
    const foundFiles: { id: string; path: string; name: string }[] = [];

    while (foldersToRead.length > 0) {
      const folderInfo = foldersToRead.shift();
      if (!folderInfo) break;

      const { files } = await driveApi.listFiles(accessToken, folderInfo.id).catch((error) => {
        processErrorExpectations(error, folderInfo.path, 'files search');
        return { files: [] };
      });
      files.forEach((file) => {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          foldersToRead.push({
            id: file.id,
            path: folderInfo.path + (folderInfo.path !== '' ? '/' : '') + file.name,
          });
        } else if (file.name.slice(-3) === '.md') {
          foundFiles.push({ name: file.name, path: folderInfo.path, id: file.id });
        }
      });
    }

    const articles: VaultIndexSlice['articles'] = {};

    for (const file of foundFiles) {
      const entity = `file: ${file.path}/${file.name}`;
      const fileContent = await driveApi.getTextFileContent(accessToken, file.id).catch((error) => {
        processErrorExpectations(error, entity, 'filex indexing');
        return null;
      });

      if (fileContent !== null) {
        const article = articleService.parseArticle({
          ...file,
          driveId: file.id,
          text: fileContent,
        });
        articles[article.articleId] = article;

        vaultIndexStore.updateVaultIndex({
          lastIndexed: article.articleId,
          totalIndexed: Object.keys(articles).length,
        });
      } else {
        logWarning(
          `file ${file.path}/${file.name} was skipeed due to earlier error`,
          process + ' - file indexing',
          {
            entity,
            payload: file,
          },
        );
      }
    }

    vaultIndexStore.setArticles(articles);
    vaultIndexStore.finishVaultIndex({
      status: 'ok',
      totalIndexed: Object.keys(articles).length,
      finished: new Date(),
    });
  };
}

function processErrorExpectations(entity: string, place: string, error: unknown): void {
  logError(error, place, entity);
  if (error instanceof DriveApiAuthenticationError) {
    // abort the process
    throw new UserNotAuthorised();
  } else if (error instanceof DriveApiFileNotFoundError) {
    // continue the process
  } else if (error instanceof DriveApiUnexpectedAnswerError) {
    // continue the process
  } else {
    // rethrow
    throw new ProcessUnhandledError({ process, cause: error });
  }
}
