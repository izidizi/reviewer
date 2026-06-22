import { patchState, signalStore, withMethods, withState, withComputed } from '@ngrx/signals';
import { initialIndexVaultSlice } from './index-vault.slice';
import * as updaters from './index-vault.updaters';
import { computed } from '@angular/core';

export type IndexVaultStore = InstanceType<typeof IndexVaultStore>;
export const IndexVaultStore = signalStore(
  { providedIn: 'root' },
  withState(initialIndexVaultSlice),
  withComputed((store) => ({
    isIndexProcessActive: computed(() => store.mode() !== null && store.result() === null),
  })),
  withMethods((store) => {
    return {
      start: (data: updaters.StartData) => patchState(store, updaters.start(data)),
      update: (data: updaters.UpdateData) => patchState(store, updaters.update(data)),
      finish: (data: updaters.FinishData) => patchState(store, updaters.finish(data)),
    };
  }),
);
