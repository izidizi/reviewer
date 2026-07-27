import { inject, InjectionToken } from '@angular/core';
import { generate } from '../model/article-id';
import { ReviewStorage } from '../../model/storage/review';
import { StatisticsStore } from '../store/statistics/statistics.store';
import { isReviewResult, ReviewResultUnknown } from '../model/review-result';
import { VaultArticleStatistics } from '../model/vault-article-statistics';
import { CalculateArticleScoreLogic } from './calculate-article-score';
import { getPath } from '../model/path';

export type UpdateArticleStatisticsLogic = (review: ReviewStorage) => void;
export const UpdateArticleStatisticsLogic = new InjectionToken<UpdateArticleStatisticsLogic>(
  'UpdateArticleStatisticsLogic',
  {
    providedIn: 'root',
    factory: () => {
      const staisticsStore = inject(StatisticsStore);
      const calculateArticleScore = inject(CalculateArticleScoreLogic);

      return (review) => {
        const articleId = generate(getPath(review.path), review.name);
        const articleStatistics = staisticsStore.articles()[articleId];

        const reviewed = new Date(review.reviewed);
        const result = isReviewResult(review.result) ? review.result : ReviewResultUnknown;

        const lastResult =
          (articleStatistics?.lastReview ?? 0) > reviewed ? articleStatistics!.lastResult : result;
        const lastReview =
          (articleStatistics?.lastReview ?? 0) > reviewed
            ? articleStatistics!.lastReview
            : reviewed;

        const total: VaultArticleStatistics['total'] = {
          incomplete: articleStatistics?.total.incomplete ?? 0,
          negative: articleStatistics?.total.negative ?? 0,
          positive: articleStatistics?.total.positive ?? 0,
          unknown: articleStatistics?.total.unknown ?? 0,
        };
        total[result] += 1;

        const score = calculateArticleScore(total);
        const lastReviewInterval_days = (Date.now() - lastReview.getTime()) / 1000 / 60 / 60 / 24;

        staisticsStore.setArticle({
          articleStatistics: {
            articleId,
            lastResult,
            lastReview,
            total,
            score,
            lastReviewInterval_days,
          },
        });
      };
    },
  },
);
