import { inject, InjectionToken } from '@angular/core';
import { DriveApiService } from '../../services/drive-api/drive-api.service';
import { LogoutProcess } from './logout.process';
import { DriveApiAuthenticationError } from '../../services/drive-api/drive-api-errors';
import { CheckAuthProcess } from './check-auth.process';
import { Path } from '../model/path';
import { ProcessError, ProcessUnhandledError } from '../../model/error/process-error';
import { ConfigurationStore } from '../store/configuration/configuration.store';
import { VaultIndexSlice } from '../store/vault-index/vault-index.slice';
import { ArticleService } from '../../services/article/article.service';
import { VaultIndexStore } from '../store/vault-index/vault-index.store';

export class RootPathNotFound extends ProcessError {
  constructor(path: Path) {
    super({ process: 'IndexVaultProcess', message: `root path ${path.join('/')} not found` });
  }
}

export type IndexVaultProcess = () => Promise<void>;
export const IndexVaultProcess = new InjectionToken<IndexVaultProcess>('IndexVaultProcess', {
  providedIn: 'root',
  factory: () => {
    const driveApi = inject(DriveApiService);
    const articleService = inject(ArticleService);
    const configurationStore = inject(ConfigurationStore);
    const vaultIndexStore = inject(VaultIndexStore);
    const logoutProcess = inject(LogoutProcess);
    const checkAuthProcess = inject(CheckAuthProcess);

    return indexVaultProcess({
      driveApi,
      articleService,
      configurationStore,
      vaultIndexStore,
      logoutProcess,
      checkAuthProcess,
    });
  },
});

function indexVaultProcess({
  driveApi,
  articleService,
  configurationStore,
  vaultIndexStore,
  logoutProcess,
  checkAuthProcess,
}: {
  driveApi: DriveApiService;
  articleService: ArticleService;
  configurationStore: ConfigurationStore;
  vaultIndexStore: VaultIndexStore;
  logoutProcess: LogoutProcess;
  checkAuthProcess: CheckAuthProcess;
}): IndexVaultProcess {
  return async () => {
    const accessToken = await checkAuthProcess();

    const path: Path = configurationStore.configurationPath();

    let rootId: string | null = null;

    try {
      for (const pathItem of path) {
        const { files } = await driveApi.listFiles(accessToken, rootId ?? 'root');
        rootId =
          files.find(
            ({ mimeType, name }) =>
              mimeType === 'application/vnd.google-apps.folder' && name === pathItem,
          )?.id ?? null;

        if (rootId === null) {
          throw new RootPathNotFound(path);
        }
      }

      if (rootId === null) {
        throw new RootPathNotFound(path);
      }

      const foldersToRead: { id: string; path: string }[] = [{ id: rootId, path: '' }];
      const foundFiles: { id: string; path: string; name: string }[] = [];

      while (foldersToRead.length > 0) {
        const folderInfo = foldersToRead.shift();
        if (!folderInfo) break;

        const { files } = await driveApi.listFiles(accessToken, folderInfo.id);
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
        const fileContent = await driveApi.getTextFileContent(accessToken, file.id);
        const article = articleService.parseArticle({
          ...file,
          driveId: file.id,
          text: fileContent,
        });
        articles[article.articleId] = article;
      }

      vaultIndexStore.setArticles(articles);

      console.log(articles);
    } catch (error) {
      if (error instanceof DriveApiAuthenticationError) {
        await logoutProcess();
        return;
      }
      console.warn(error);

      throw new ProcessUnhandledError({ process: 'ListVaultFilesProcess', cause: error });
    }
  };
}
