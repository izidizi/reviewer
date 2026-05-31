import { ArticleId } from '../../model/article-id';
import { VaultArticle } from '../../model/vault-article';

export interface VaultIndexSlice {
  articles: { [articleId: ArticleId]: VaultArticle | undefined };
}

export const initialVaultIndexSlice: VaultIndexSlice = {
  articles: {},
};
