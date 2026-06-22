import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { initialVaultSlice } from './vault.slice';
import * as updaters from './vault.updates';
import { ArticleId } from '../../model/article-id';
import { computed } from '@angular/core';
import { createArticle, VaultArticle } from '../../model/vault-article';

export type VaultStore = InstanceType<typeof VaultStore>;

export const VaultStore = signalStore(
  { providedIn: 'root' },
  withState(initialVaultSlice),
  // withComputed((store) => vaultIndexDerived(store)),
  withMethods((store) => {
    return {
      addArticle: (data: updaters.AddArticleData) => patchState(store, updaters.addArticle(data)),
      removeArticle: (data: updaters.RemoveArticleData) =>
        patchState(store, updaters.removeArticle(data)),

      addReview: (data: updaters.AddReviewData) => patchState(store, updaters.addReview(data)),
      removeReviews: (data: updaters.RemoveReviews) =>
        patchState(store, updaters.revoceReviews(data)),
    };
  }),

  /**
   * views
   */
  withMethods((store) => {
    return {
      article: (articleId: ArticleId) =>
        computed((): VaultArticle | null => {
          console.log(`compute VaultArticle for [${articleId}]`);
          const article = store.articlesIndex()[articleId];
          return article ? createArticle(article) : null;
        }),
    };
  }),
);
