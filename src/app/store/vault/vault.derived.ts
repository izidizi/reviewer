import { StateSignals } from '@ngrx/signals';
import { VaultSlice } from './vault.slice';
import { computed, inject } from '@angular/core';
import { CreateArticleLogicToken } from '../../process-bl/create-article';

export const vaultDerived = (store: StateSignals<VaultSlice>) => {
  const createArticle = inject(CreateArticleLogicToken);

  return {
    articles: computed(() =>
      Object.values(store.articlesIndex())
        .filter((articleStorage) => !!articleStorage)
        .map((articleStorage) => createArticle(articleStorage)),
    ),
  };
};
