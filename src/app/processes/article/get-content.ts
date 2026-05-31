import { GetArticleContentProcess } from '.';
import { ProcessError } from '../../../model/error/process-error';
import { isValidDate } from '../../../model/utils/invalid-date';
import { DriveApiService } from '../../../services';
import { ArticleService } from '../../../services/article/article.service';
import { DriveApiAuthenticationError } from '../../../services/drive-api/drive-api-errors';
import { parseArticleId } from '../../model/article-id';
import { VaultIndexStore } from '../../store/vault-index/vault-index.store';
import { CheckAuthProcess } from '../check-auth.process';
import { LogoutProcess } from '../logout.process';

export class InvalidArticleIdError extends ProcessError {
  constructor(id: string) {
    super({ process: 'GetArticleContentProcess', message: `[${id}] is not valid ArticleId` });
  }
}

export class EdgeCaseContentLoadingNotImplemented extends ProcessError {
  constructor(id: string) {
    super({
      process: 'GetArticleContentProcess',
      message: `[${id}] is not in the index, this case is not implemented`,
    });
  }
}

export function getArticleContentProcess({
  driveApi,
  logoutProcess,
  checkAuthProcess,
  vaultIndexStore,
  articleService,
}: {
  driveApi: DriveApiService;
  logoutProcess: LogoutProcess;
  checkAuthProcess: CheckAuthProcess;
  vaultIndexStore: VaultIndexStore;
  articleService: ArticleService;
}): GetArticleContentProcess {
  return async (articleId) => {
    const indexArticle = vaultIndexStore.articles()[articleId];

    if (
      indexArticle &&
      indexArticle.content !== null &&
      isValidDate(indexArticle.indexed) /* && indexArticle.indexed > [cache threshold] */
    ) {
      return indexArticle.content;
    }

    const accessToken = await checkAuthProcess();

    const { path, name } = indexArticle ? indexArticle : parseArticleId(articleId);
    let driveId = indexArticle?.driveId;
    if (!name) throw new InvalidArticleIdError(articleId);
    if (!driveId) {
      throw new EdgeCaseContentLoadingNotImplemented(articleId);
    }

    try {
      const text = await driveApi.getTextFileContent(accessToken, driveId);
      const article = articleService.parseArticle({ driveId, path, name, text });
      vaultIndexStore.indexArticle(article);

      return article.content;
    } catch (error) {
      if (error instanceof DriveApiAuthenticationError) {
        await logoutProcess();
      }

      throw error;
    }
  };
}
