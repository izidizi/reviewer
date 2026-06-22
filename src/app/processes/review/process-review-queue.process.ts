import { logDebug, logError, logWarning } from '../../../services/debug-logger';
import { ProcessReviewQueueProcess } from '.';
import { VaultStore } from '../../store/vault/vault.store';
import { VaultStateStore } from '../../store/vault-state/vault-state.store';
import { UpdateArticleStatisticsLogic } from '../../process-bl/update-article-statistics';
import { UpdateExerciseStatisticsLogic } from '../../process-bl/update-exercise-statistics';
import { UpdateDayStatisticsLogic } from '../../process-bl/update-day-statistics';

const process = 'processReviewQueueProcess';
export function processReviewQueueProcess({
  vaultStore,
  vaultStateStore,
  updateArticleStatistics,
  updateExerciseStatistics,
  updateDayStatistics,
}: {
  vaultStore: VaultStore;
  vaultStateStore: VaultStateStore;
  updateArticleStatistics: UpdateArticleStatisticsLogic;
  updateExerciseStatistics: UpdateExerciseStatisticsLogic;
  updateDayStatistics: UpdateDayStatisticsLogic;
}): ProcessReviewQueueProcess {
  return async () => {
    logDebug(`${process} - start`, { includeStack: true });

    const queue = vaultStateStore.reviewsQueue();
    if (queue.length === 0) {
      logDebug(`${process} - early exit, no records to process`, { includeStack: true });
      return;
    }

    logDebug(`${process} - queue contains ${queue.length} records`);

    queue.forEach(({ reviewsQueueId, articleId, review }) => {
      logDebug(`${process} - processing record`, {
        entity: `#${reviewsQueueId} for [${articleId}]`,
      });

      updateArticleStatistics(review);
      updateExerciseStatistics(review);
      updateDayStatistics(review);

      vaultStore.addReview({ articleId, review });
    });

    vaultStateStore.setReviewQueue({ reviewsQueue: [] });

    logDebug(`${process} - finish`, {});
  };
}
