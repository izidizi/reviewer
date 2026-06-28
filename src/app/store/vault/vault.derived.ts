import { StateSignals } from '@ngrx/signals';
import { VaultSlice } from './vault.slice';
import { computed } from '@angular/core';
import { createArticle } from '../../model/vault-article';

export const vaultDerived = (store: StateSignals<VaultSlice>) => ({
  articles: computed(() =>
    Object.values(store.articlesIndex())
      .filter((articleStorage) => !!articleStorage)
      .map((articleStorage) => createArticle(articleStorage)),
  ),
});
