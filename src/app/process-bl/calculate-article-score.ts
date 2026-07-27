import { InjectionToken } from '@angular/core';
import { VaultArticleStatistics } from '../model/vault-article-statistics';
import { reviewResultScore } from '../model/review-result';

export type CalculateArticleScoreLogic = (total: VaultArticleStatistics['total']) => number;
export const CalculateArticleScoreLogic = new InjectionToken<CalculateArticleScoreLogic>(
  'CalculateArticleScoreLogic',
  {
    providedIn: 'root',
    factory: () => {
      return ({ negative, incomplete, positive }) => {
        const negativeScore = reviewResultScore('negative');
        const incompleteScore = reviewResultScore('incomplete');
        const positiveScore = reviewResultScore('positive');

        const knownReviews = negative + incomplete + positive;
        const score =
          (negative * negativeScore + incomplete * incompleteScore + positive * positiveScore) /
          knownReviews;
        return Math.floor(score * 10) / 10;
      };
    },
  },
);
