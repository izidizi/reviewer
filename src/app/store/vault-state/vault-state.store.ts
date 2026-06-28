import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import * as updaters from './vault-state.updaters';
import { initialVaultStateSlice } from './vault-state.slice';
import { computed, inject } from '@angular/core';
import { ConfigurationStore } from '../configuration/configuration.store';

export type VaultStateStore = InstanceType<typeof VaultStateStore>;

export const VaultStateStore = signalStore(
  { providedIn: 'root' },
  withState(initialVaultStateSlice),
  // withComputed((store) => vaultIndexDerived(store)),
  withMethods((store) => {
    return {
      setHasChanges: (data: updaters.SetHasChangesData) =>
        patchState(store, updaters.setHasChanges(data)),
      setReviewQueue: (data: updaters.SetReviewQueueData) =>
        patchState(store, updaters.setReviewQueue(data)),
      setReviewsQueueId: (data: updaters.SetReviewsQueueIdData) =>
        patchState(store, updaters.setReviewsQueueId(data)),
    };
  }),

  /**
   * views
   */
  // withMethods((store) => {
  //   const configuration = inject(ConfigurationStore);

  //   return {
  //     hasChanges: () => computed(() => store.hasChanges() || configuration.isUpdated()),
  //   };
  // }),
);
