import { ArticleId } from './article-id';
import { ReviewResult } from './review-result';

export type VaultArticleExerciseStat = {
  articleId: ArticleId;
  started: Date;
  repeates: Date[];
  consolidations: { date: Date; result: ReviewResult }[];
};
