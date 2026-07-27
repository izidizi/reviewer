import { inject, InjectionToken } from '@angular/core';
import { generate } from '../model/article-id';
import { ReviewStorage } from '../../model/storage/review';
import { StatisticsStore } from '../store/statistics/statistics.store';
import { isReviewResult, ReviewResultUnknown } from '../model/review-result';
import { VaultStore } from '../store/vault/vault.store';
import { isISO8601String } from '../../model/utils';
import { getPath } from '../model/path';

export type UpdateExerciseStatisticsLogic = (review: ReviewStorage) => void;
export const UpdateExerciseStatisticsLogic = new InjectionToken<UpdateExerciseStatisticsLogic>(
  'UpdateExerciseStatisticsLogic',
  {
    providedIn: 'root',
    factory: () => {
      const staisticsStore = inject(StatisticsStore);
      const vault = inject(VaultStore);

      return (review) => {
        // TODO: get configuration from ??? (somewhere else!)
        const configuration = vault.exerciseConfiguration();
        const startDate = isISO8601String(configuration.startDate)
          ? new Date(configuration.startDate)
          : new Date('2026-01-01');
        const repeatTimes = configuration.repeatTimes;

        const articleId = generate(getPath(review.path), review.name);
        const exerciseStatistics = staisticsStore.exercises()[articleId];

        const reviewed = new Date(review.reviewed);
        const result = isReviewResult(review.result) ? review.result : ReviewResultUnknown;

        if (reviewed < startDate) return;

        let mode: 'new' | 'repeat' | 'consolidation';
        if (!exerciseStatistics) {
          mode = 'new';
        } else if (exerciseStatistics.repeates.length < repeatTimes) {
          mode = 'repeat';
        } else {
          mode = 'consolidation';
        }

        staisticsStore.setExercise({
          exerciseStatistics: {
            articleId,
            started: mode === 'new' ? reviewed : exerciseStatistics!.started,
            startResult: mode === 'new' ? result : exerciseStatistics!.startResult,
            repeates:
              mode === 'repeat'
                ? [...(exerciseStatistics?.repeates ?? []), reviewed]
                : (exerciseStatistics?.repeates ?? []),
            consolidations:
              mode === 'consolidation'
                ? [...(exerciseStatistics?.consolidations ?? []), { date: reviewed, result }]
                : (exerciseStatistics?.consolidations ?? []),
          },
        });
      };
    },
  },
);
