import {
  getState,
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { effect } from '@angular/core';
import { parsePath, Path } from '../../model/path';
import { initialVaultIndexSlice, VaultIndexSlice } from './vault-index.slice';
import * as updaters from './vault-index.updaters';
import { VaultArticle } from '../../model/vault-article';

export type VaultIndexStore = InstanceType<typeof VaultIndexStore>;

export const VaultIndexStore = signalStore(
  { providedIn: 'root' },
  withState(initialVaultIndexSlice),
  withMethods((store) => {
    return {
      setArticles: (articles: VaultIndexSlice['articles']) =>
        patchState(store, updaters.setArticles(articles)),
      indexArticle: (article: VaultArticle) => patchState(store, updaters.indexArticle(article)),
    };
  }),
);
