import { inject, InjectionToken } from '@angular/core';
import { generate } from '../model/article-id';
import { ReviewStorage } from '../../model/storage/review';
import { StatisticsStore } from '../store/statistics/statistics.store';
import { isReviewResult, ReviewResultUnknown } from '../model/review-result';
import { toISO6801DateString } from '../../model/utils/iso8601-string';
import { getPath } from '../model/path';

export type UpdateDayStatisticsLogic = (review: ReviewStorage) => void;
export const UpdateDayStatisticsLogic = new InjectionToken<UpdateDayStatisticsLogic>(
  'UpdateDayStatisticsLogic',
  {
    providedIn: 'root',
    factory: () => {
      const staisticsStore = inject(StatisticsStore);

      return (review) => {
        if (!isReviewResult(review.result) || review.result === ReviewResultUnknown) return;
        const date = toISO6801DateString(review.reviewed);
        const dayStatistics = staisticsStore.days()[date];

        staisticsStore.setDay({
          dayStatistics: {
            date,
            reviews: [
              ...(dayStatistics?.reviews ?? []),
              {
                articleId: generate(getPath(review.path), review.name),
                reviewed: new Date(review.reviewed),
                result: review.result,
              },
            ],
          },
        });
      };
    },
  },
);
