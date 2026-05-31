import { ISO8601DateString } from '../../model/utils/iso8601-string';
import { ArticleId } from './article-id';
import { ReviewResult } from './review-result';

export type VaultDayStatistics = {
  date: ISO8601DateString;
  reviews: {
    articleId: ArticleId;
    reviewed: Date;
    result: ReviewResult;
  }[];
};
