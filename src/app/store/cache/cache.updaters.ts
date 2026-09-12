import { PartialStateUpdater } from '@ngrx/signals';
import { ArticleId } from '../../model/article-id';
import { CacheSlice } from './cache.slice';

export type CacheArticleData = {
  articleId: ArticleId;
  content: string;
};
export const cacheArticle: (data: CacheArticleData) => PartialStateUpdater<CacheSlice> =
  ({ articleId, content }) =>
  (store) => ({
    articlesContent: {
      ...store.articlesContent,
      [articleId]: {
        timestamp: new Date(),
        content,
      },
    },
  });

export type RemoveArticleData = {
  articleId: ArticleId;
};
export const removeArticle: (data: RemoveArticleData) => PartialStateUpdater<CacheSlice> =
  ({ articleId }) =>
  (store) => ({
    articlesContent: {
      ...store.articlesContent,
      [articleId]: undefined,
    },
  });
