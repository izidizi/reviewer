import { PartialStateUpdater } from '@ngrx/signals';
import { VaultIndexSlice } from './vault-index.slice';
import { VaultArticle } from '../../model/vault-article';
import { ArticleId } from '../../model/article-id';

export const setArticles: (
  articles: VaultIndexSlice['articles'],
) => PartialStateUpdater<VaultIndexSlice> = (articles) => {
  return () => ({
    articles,
  });
};

export const indexArticle: (article: VaultArticle) => PartialStateUpdater<VaultIndexSlice> = (
  article,
) => {
  return ({ articles }) => ({
    articles: {
      ...articles,
      [article.articleId]: article,
    },
  });
};
