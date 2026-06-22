import { GetArticleContentProcess } from '.';
import { ProcessError, ProcessUnhandledError } from '../../../model/error/process-error';
import { isValidDate, parseDate } from '../../../model/utils/invalid-date';
import { DriveApiService } from '../../../services/drive-api';
import { logDebug, logError, logInfo } from '../../../services/debug-logger';
import {
  DriveApiAuthenticationError,
  DriveApiFileNotFoundError,
  DriveApiUnexpectedAnswerError,
} from '../../../services/drive-api/drive-api-errors';
import { CheckAuthBL, UserNotAuthorised, ParseArticleIdBL } from '../../process-bl';
import { VaultStore } from '../../store/vault/vault.store';
import { VaultStateStore } from '../../store/vault-state/vault-state.store';
import { CacheStore } from '../../store/cache/cache.store';
import { ParseArticleLogic } from '../../process-bl/parse-article';
import { GetFileDriveIdProcess } from '../drive';
import { isPath, parsePath } from '../../model/path';
import { isVaultFile } from '../../model/vault-file';

export class NotImplemetedCaseError extends ProcessError {
  constructor() {
    super({
      process,
      message: `loading article content withoud driveId is not yet possible`,
    });
  }
}

export class NotValidArticleNameError extends ProcessError {
  constructor(articleId: string, name: string) {
    super({
      process,
      message: `[${articleId}] couldn't be loaded using, name "${name}" is not valid`,
    });
  }
}

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

export class UnexpectedArticleHasBeenLoadedError extends ProcessError {
  constructor(articleId: string, loadedArticleId: string) {
    super({ process, message: `while loading article [${articleId}] got [${loadedArticleId}]` });
  }
}

const process = 'GetArticleContentProcess';
export function getArticleContentProcess({
  driveApi,
  parseArticleId,
  checkAuth,
  vault,
  vaultState,
  cache,
  parseArticle,
}: {
  driveApi: DriveApiService;
  parseArticleId: ParseArticleIdBL;
  checkAuth: CheckAuthBL;
  vault: VaultStore;
  vaultState: VaultStateStore;
  cache: CacheStore;
  parseArticle: ParseArticleLogic;
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
    const indexArticle = vault.articlesIndex()[articleId];
    const cachedContent = cache.articlesContent()[articleId];
    const indexed = parseDate(indexArticle?.indexed);

    logDebug(`${process} - article index record`, {
      entity,
      payload: {
        articleId,
        exists: !!indexArticle,
        hasContent: !!cachedContent,
        indexed: (indexArticle?.indexed ?? '--').toString(),
      },
    });
    if (
      indexArticle &&
      cachedContent?.content &&
      isValidDate(indexed) /* && indexArticle.indexed > [cache threshold] */
    ) {
      logDebug(`${process} - early finish with cached content`, {
        payload: { article: { ...cachedContent } },
      });
      return cachedContent.content;
    }

    logDebug(`${process} - loading article content`, { entity, payload: { articleId } });
    const accessToken = await checkAuth();

    const { path, name } = indexArticle ? indexArticle : parseArticleId(articleId);
    const driveId = indexArticle?.driveId;
    if (!driveId) {
      // abort the process
      throw new NotImplemetedCaseError();
    }

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
    const {
      articleId: parsedArticleId,
      article,
      content,
    } = parseArticle({ driveId, path, name, text, pathTopic: path[1] });

    if (articleId !== parsedArticleId) {
      throw new UnexpectedArticleHasBeenLoadedError(articleId, parsedArticleId);
    }

    logDebug(`${process} - updating store`, { entity, payload: { article } });
    vault.addArticle({ articleId, article });
    cache.cacheArticle({ articleId, content });

    logDebug(`${process} - finish`, { entity });
    return content;
  };
}
