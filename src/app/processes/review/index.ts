import { inject, InjectionToken } from '@angular/core';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { reviewProcess } from './review.process';
import { ArticleId } from '../../model/article-id';
import { ReviewResult } from '../../model/review-result';
import { processReviewQueueProcess } from './process-review-queue.process';
import { VaultStore } from '../../store/vault/vault.store';
import { VaultStateStore } from '../../store/vault-state/vault-state.store';
import { UpdateArticleStatisticsLogic } from '../../process-bl/update-article-statistics';
import { UpdateExerciseStatisticsLogic } from '../../process-bl/update-exercise-statistics';
import { UpdateDayStatisticsLogic } from '../../process-bl/update-day-statistics';
import { EnqueueReviewLogic } from '../../process-bl';

export type ReviewProcess = (article: ArticleId, result: ReviewResult) => void;
export const ReviewProcess = new InjectionToken<ReviewProcess>('ReviewProcess', {
  providedIn: 'root',
  factory: () => {
    const vaultStore = inject(VaultStore);
    const exerciseStore = inject(ExerciseStore);
    const enqueueReview = inject(EnqueueReviewLogic);

    return reviewProcess({
      vaultStore,
      exerciseStore,
      enqueueReview,
    });
  },
});

export type ProcessReviewQueueProcess = () => void;
export const ProcessReviewQueueProcess = new InjectionToken<ProcessReviewQueueProcess>(
  'ProcessReviewQueueProcess',
  {
    providedIn: 'root',
    factory: () => {
      const vaultStore = inject(VaultStore);
      const vaultStateStore = inject(VaultStateStore);
      const updateArticleStatistics = inject(UpdateArticleStatisticsLogic);
      const updateExerciseStatistics = inject(UpdateExerciseStatisticsLogic);
      const updateDayStatistics = inject(UpdateDayStatisticsLogic);

      return processReviewQueueProcess({
        vaultStore,
        vaultStateStore,
        updateArticleStatistics,
        updateExerciseStatistics,
        updateDayStatistics,
      });
    },
  },
);
