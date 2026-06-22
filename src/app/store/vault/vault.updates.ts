import { PartialStateUpdater } from '@ngrx/signals';
import { VaultSlice } from './vault.slice';
import { ArticleId } from '../../model/article-id';
import { VaultIndexArticleStorage } from '../../../model/storage/vault-index';
import { ReviewStorage } from '../../../model/storage/review';

export type AddArticleData = {
  articleId: ArticleId;
  article: VaultIndexArticleStorage;
};
export const addArticle: (data: AddArticleData) => PartialStateUpdater<VaultSlice> =
  ({ articleId, article }) =>
  (store) => ({
    articlesIndex: {
      ...store.articlesIndex,
      [articleId]: article,
    },
  });

export type RemoveArticleData = { articleId: ArticleId; hasChanges: boolean };
export const removeArticle: (data: RemoveArticleData) => PartialStateUpdater<VaultSlice> =
  ({ articleId, hasChanges }) =>
  (store) => ({
    hasChanges,
    articlesIndex: {
      ...store.articlesIndex,
      [articleId]: undefined,
    },
  });

export type AddReviewData = {
  articleId: ArticleId;
  review: ReviewStorage;
};
export const addReview: (data: AddReviewData) => PartialStateUpdater<VaultSlice> =
  ({ articleId, review }) =>
  (store) => ({
    reviewsIndex: {
      ...store.reviewsIndex,
      [articleId]: [...(store.reviewsIndex[articleId] ?? []), review],
    },
  });

export type RemoveReviews = {
  articleId: ArticleId;
};
export const revoceReviews: (data: RemoveReviews) => PartialStateUpdater<VaultSlice> =
  ({ articleId }) =>
  (store) => ({
    reviewsIndex: {
      ...store.reviewsIndex,
      [articleId]: undefined,
    },
  });
