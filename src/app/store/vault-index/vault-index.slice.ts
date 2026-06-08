import { ArticleId } from '../../model/article-id';
import { VaultArticle } from '../../model/vault-article';

export interface VaultIndexSlice {
  isUpdated: boolean;
  articles: { [articleId: ArticleId]: VaultArticle | undefined };
  vaultIndexProcess: {
    mode: null | 'new' | 'all';
    statistics: {
      started: Date;
      lastIndexed: ArticleId | null;
      totalIndexed: number;
    } | null;
    result: {
      status: 'ok' | 'error';
      finished: Date;
      error?: Error;
    } | null;
  };
}

export const initialVaultIndexSlice: VaultIndexSlice = {
  isUpdated: false,
  articles: {},
  vaultIndexProcess: {
    mode: null,
    statistics: null,
    result: null,
  },
};
