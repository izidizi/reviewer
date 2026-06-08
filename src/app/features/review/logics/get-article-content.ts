import { inject, InjectionToken } from '@angular/core';
import { GetArticleContentProcess } from '../../../processes/article';
import { VaultIndexArticleProcess } from '../../../processes/vault';
import { ArticleId } from '../../../model/article-id';
import { ArticleByDriveIdNotFoundError } from '../../../processes/article/get-content';
import { logDebug, logError } from '../../../../services/debug-logger';
import { DefaultErrorsProcess } from '../../../processes/default-errors.process';
import { NotificationService } from '../../../services/notification.service';

const place = 'LoadArticleContentLogic';
export type LoadArticleContentLogic = (articleId: ArticleId) => Promise<void>;
export const LoadArticleContentLogic = new InjectionToken<LoadArticleContentLogic>(place, {
  factory: () => {
    const notificationService = inject(NotificationService);
    const getArticleContentProcess = inject(GetArticleContentProcess);
    const indexArticleProcess = inject(VaultIndexArticleProcess);
    const defaultErrorsProcess = inject(DefaultErrorsProcess);

    return async (articleId) => {
      logDebug(`${place} - start`, { entity: `article: [${articleId}]`, includeStack: true });
      try {
        await getArticleContentProcess(articleId).catch(async (error) => {
          if (error instanceof ArticleByDriveIdNotFoundError) {
            logDebug(`${place} - swith to indexArticleProcess`, {
              entity: `article: [${articleId}]`,
              includeStack: true,
            });
            await indexArticleProcess(articleId);
          } else {
            throw error;
          }
        });
      } catch (error) {
        logError(error, place);
        if (await defaultErrorsProcess(error)) return;

        notificationService.showError(error);
      }
      logDebug(`${place} - finish`, { entity: `article: [${articleId}]`, includeStack: true });
    };
  },
});
