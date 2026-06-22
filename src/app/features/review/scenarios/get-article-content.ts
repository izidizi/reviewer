import { inject, InjectionToken } from '@angular/core';
import { GetArticleContentProcess } from '../../../processes/article';
import { ArticleId } from '../../../model/article-id';
import { ArticleByDriveIdNotFoundError } from '../../../processes/article/get-content';
import { logDebug, logError } from '../../../../services/debug-logger';
import { DefaultErrorsProcess } from '../../../processes/default-errors.process';
import { NotificationService } from '../../../services/notification.service';

const place = 'LoadArticleContentScenario';
export type LoadArticleContentScenario = (articleId: ArticleId) => Promise<void>;
export const LoadArticleContentScenario = new InjectionToken<LoadArticleContentScenario>(place, {
  factory: () => {
    const notificationService = inject(NotificationService);
    const getArticleContentProcess = inject(GetArticleContentProcess);
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
