import { ArticleId } from './article-id';
import { ReviewResult } from './review-result';

export type VaultArticleStatistics = {
  articleId: ArticleId;
  total: {
    [outcome in ReviewResult]: number;
  };
  lastReview: Date;
  lastResult: ReviewResult;
  lastReviewInterval_days: number;
};
