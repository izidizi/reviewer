import { ArticleId } from './article-id';
import { ReviewResult } from './review-result';

export type VaultArticleExerciseStat = {
  articleId: ArticleId;
  started: Date;
  startResult: ReviewResult;
  repeates: Date[];
  consolidations: { date: Date; result: ReviewResult }[];
};
