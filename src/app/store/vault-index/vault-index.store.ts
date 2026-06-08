import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { initialVaultIndexSlice, VaultIndexSlice } from './vault-index.slice';
import * as updaters from './vault-index.updaters';
import { VaultArticle } from '../../model/vault-article';
import { vaultIndexDerived } from './vault-index.derived';

export type VaultIndexStore = InstanceType<typeof VaultIndexStore>;

export const VaultIndexStore = signalStore(
  { providedIn: 'root' },
  withState(initialVaultIndexSlice),
  withComputed((store) => vaultIndexDerived(store)),
  withMethods((store) => {
    return {
      setArticles: (articles: VaultIndexSlice['articles']) =>
        patchState(store, updaters.setArticles(articles)),
      indexArticle: (article: VaultArticle) => patchState(store, updaters.indexArticle(article)),
      resetIsUpdated: () => patchState(store, updaters.resetIsUpdated()),

      startVaultIndex: (data: updaters.StartVaultIndexData) =>
        patchState(store, updaters.startVaultIndex(data)),
      updateVaultIndex: (data: updaters.UpdateVaultIndexData) =>
        patchState(store, updaters.updateVaultIndex(data)),
      finishVaultIndex: (data: updaters.FinishVaultIndexData) =>
        patchState(store, updaters.finishVaultIndex(data)),
    };
  }),
);
