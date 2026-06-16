import { DriveApiService } from '../../../services/drive-api/drive-api.service';
import { ArticleService } from '../../../services/article/article.service';
import { VaultIndexStore } from '../../store/vault-index/vault-index.store';
import { VaultIndexArticleProcess } from '.';
import { ProcessError, ProcessUnhandledError } from '../../../model/error/process-error';
import {
  DriveApiAuthenticationError,
  DriveApiFileNotFoundError,
  DriveApiUnexpectedAnswerError,
} from '../../../services/drive-api/drive-api-errors';
import { CheckAuthBL, ParseArticleIdBL, UserNotAuthorised } from '../../process-bl';
import { DriveId } from '../../model/drive-id';
import { logDebug, logError } from '../../../services/debug-logger';
import { GetDirectoryDriveIdProcess } from '../drive';

export class ArticleNotFoundError extends ProcessError {
  constructor(entity: string) {
    super({ process, message: `${entity} not found` });
  }
}

export class ArticleLoadError extends ProcessError {
  constructor(entity: string, cause: Error) {
    super({ process, message: `${entity} couldn't be loaded`, cause });
  }
}

const process = 'VaultIndexArticleProcess';
export function vaultIndexArticleProcess({
  driveApi,
  articleService,
  parseArticleId,
  checkAuth,
  vaultIndexStore,
  getDirectoryDriveIdProcess,
}: {
  driveApi: DriveApiService;
  articleService: ArticleService;
  parseArticleId: ParseArticleIdBL;
  checkAuth: CheckAuthBL;
  vaultIndexStore: VaultIndexStore;
  getDirectoryDriveIdProcess: GetDirectoryDriveIdProcess;
}): VaultIndexArticleProcess {
  return async (articleId) => {
    const entity = `article ${articleId}`;
    logDebug(`${process} - start`, { entity, payload: { articleId }, includeStack: true });

    const accessToken = await checkAuth();

    const { path, name } = parseArticleId(articleId);

    logDebug(`${process} - dir driveId lookup`, { entity, payload: { articleId, path } });
    const articleDirectoryDriveId = await getDirectoryDriveIdProcess(accessToken, path);

    logDebug(`${process} - article driveId lookup`, { entity, payload: { articleId, path } });
    let articleDriveId: DriveId | null = null;
    const { files } = await driveApi
      .listFiles(accessToken, articleDirectoryDriveId)
      .catch((error) => {
        processErrorExpectations(entity, 'article driveId lookup', error);
      });
    files.forEach((file) => {
      if (file.name === name) {
        articleDriveId = file.id as DriveId;
      }
    });

    if (!articleDriveId) throw new ArticleNotFoundError(articleId);

    logDebug(`${process} - article content loading`, { entity, payload: { articleId, path } });
    const fileContent = await driveApi
      .getTextFileContent(accessToken, articleDriveId)
      .catch((error) => {
        processErrorExpectations(entity, 'article content loading', error);
      });

    logDebug(`${process} - parsing`, {
      entity,
      payload: { articleId, contentLength: fileContent.length },
    });
    const article = articleService.parseArticle({
      path,
      name,
      driveId: articleDriveId,
      text: fileContent,
    });

    logDebug(`${process} - updating store`, { entity, payload: { article } });
    vaultIndexStore.indexArticle(article);

    logDebug(`${process} - finish`, { entity });
  };
}

function processErrorExpectations(entity: string, place: string, error: unknown): never {
  logError(error, `${process} - ${place}`, entity);
  if (error instanceof DriveApiAuthenticationError) {
    // abort the process
    throw new UserNotAuthorised();
  } else if (error instanceof DriveApiFileNotFoundError) {
    // abort the process
    throw new ArticleNotFoundError(entity);
  } else if (error instanceof DriveApiUnexpectedAnswerError) {
    // abort the process
    throw new ArticleLoadError(entity, error);
  }

  // abort the process
  throw new ProcessUnhandledError({ process, cause: error });
}
