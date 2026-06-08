import { GetArticleContentProcess } from '.';
import { ProcessError, ProcessUnhandledError } from '../../../model/error/process-error';
import { isValidDate } from '../../../model/utils/invalid-date';
import { DriveApiService } from '../../../services';
import { ArticleService } from '../../../services/article/article.service';
import { logDebug, logError, logInfo } from '../../../services/debug-logger';
import {
  DriveApiAuthenticationError,
  DriveApiFileNotFoundError,
  DriveApiUnexpectedAnswerError,
} from '../../../services/drive-api/drive-api-errors';
import { CheckAuthBL, UserNotAuthorised, ParseArticleIdBL } from '../../process-bl';
import { VaultIndexStore } from '../../store/vault-index/vault-index.store';

export class ArticleByDriveIdNotFoundError extends ProcessError {
  constructor(entity: string, id: string) {
    super({
      process,
      message: `${entity} no longer exists under [${id}] driveId`,
    });
  }
}

export class ArticleByDriveIdLoadError extends ProcessError {
  constructor(entity: string, id: string, cause: Error) {
    super({ process, message: `${entity} couldn't be loaded using driveId [${id}]`, cause });
  }
}

export class EdgeCaseContentLoadingNotImplementedError extends ProcessError {
  constructor(entity: string) {
    super({
      process,
      message: `${entity} is not in the index, this case is not yet implemented`,
    });
  }
}

const process = 'GetArticleContentProcess';
export function getArticleContentProcess({
  driveApi,
  parseArticleId,
  checkAuth,
  vaultIndexStore,
  articleService,
}: {
  driveApi: DriveApiService;
  parseArticleId: ParseArticleIdBL;
  checkAuth: CheckAuthBL;
  vaultIndexStore: VaultIndexStore;
  articleService: ArticleService;
}): GetArticleContentProcess {
  return async (articleId) => {
    const entity = `article [${articleId}]`;
    logDebug(`${process} - start`, { entity, payload: { articleId }, includeStack: true });

    logDebug(`${process} - article index record lookup`, {
      entity,
      payload: {
        articleId,
      },
    });
    const indexArticle = vaultIndexStore.articles()[articleId];

    logDebug(`${process} - article index record`, {
      entity,
      payload: {
        articleId,
        exists: !!indexArticle,
        hasContent: indexArticle?.content != null,
        indexed: (indexArticle?.indexed ?? '--').toString(),
      },
    });
    if (
      indexArticle &&
      indexArticle.content !== null &&
      isValidDate(indexArticle.indexed) /* && indexArticle.indexed > [cache threshold] */
    ) {
      logDebug(`${process} - early finish with cached content`, {
        payload: { article: { ...indexArticle } },
      });
      return indexArticle.content;
    }

    const { path, name } = indexArticle ? indexArticle : parseArticleId(articleId);
    let driveId = indexArticle?.driveId;
    if (!driveId) {
      throw new EdgeCaseContentLoadingNotImplementedError(articleId);
    }

    logDebug(`${process} - loading article content`, { entity, payload: { articleId } });
    const accessToken = await checkAuth();

    const text = await driveApi.getTextFileContent(accessToken, driveId).catch((error) => {
      logError(error, `${process} - failed to load article content`, entity);
      if (error instanceof DriveApiAuthenticationError) {
        // abort the process
        throw new UserNotAuthorised();
      } else if (error instanceof DriveApiFileNotFoundError) {
        // abort the process
        throw new ArticleByDriveIdNotFoundError(entity, driveId);
      } else if (error instanceof DriveApiUnexpectedAnswerError) {
        // abort the process
        throw new ArticleByDriveIdLoadError(entity, driveId, error);
      }

      // abort the process
      throw new ProcessUnhandledError({ process, cause: error });
    });

    logDebug(`${process} - article parsing`, { entity, payload: { articleId } });
    const article = articleService.parseArticle({ driveId, path, name, text });

    logDebug(`${process} - updating store`, { entity, payload: { article } });
    vaultIndexStore.indexArticle(article);

    logDebug(`${process} - finish`, { entity });
    return article.content;
  };
}
