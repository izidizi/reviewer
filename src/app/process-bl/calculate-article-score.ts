import { InjectionToken } from '@angular/core';
import { VaultArticleStatistics } from '../model/vault-article-statistics';

export type CalculateArticleScoreLogic = (total: VaultArticleStatistics['total']) => number;
export const CalculateArticleScoreLogic = new InjectionToken<CalculateArticleScoreLogic>(
  'CalculateArticleScoreLogic',
  {
    providedIn: 'root',
    factory: () => {
      return ({ negative, incomplete, positive }) => {
        const knownReviews = negative + incomplete + positive;
        const score = (negative + incomplete * 3 + positive * 5) / knownReviews;
        return Math.floor(score * 10) / 10;
      };
    },
  },
);
