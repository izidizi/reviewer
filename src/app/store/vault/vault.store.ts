import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { initialVaultSlice } from './vault.slice';
import * as updaters from './vault.updates';
import { ArticleId } from '../../model/article-id';
import { vaultDerived } from './vault.derived';
import { CreateArticleLogicToken } from '../../process-bl/create-article';

export type VaultStore = InstanceType<typeof VaultStore>;

export const VaultStore = signalStore(
  { providedIn: 'root' },
  withState(initialVaultSlice),
  withComputed((store) => vaultDerived(store)),
  withMethods((store) => {
    return {
      addArticle: (data: updaters.AddArticleData) => patchState(store, updaters.addArticle(data)),
      removeArticle: (data: updaters.RemoveArticleData) =>
        patchState(store, updaters.removeArticle(data)),

      addReview: (data: updaters.AddReviewData) => patchState(store, updaters.addReview(data)),
      removeReviews: (data: updaters.RemoveReviews) =>
        patchState(store, updaters.removeReviews(data)),
    };
  }),

  /**
   * views
   */
  withMethods((store) => {
    const createArticle = inject(CreateArticleLogicToken);

    return {
      article: (articleId: ArticleId) =>
        computed(() => {
          const article = store.articlesIndex()[articleId];
          return article ? createArticle(article) : null;
        }),
    };
  }),
);
