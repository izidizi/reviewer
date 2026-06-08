import { computed } from '@angular/core';
import { StateSignals } from '@ngrx/signals';
import { VaultIndexSlice } from './vault-index.slice';

export function vaultIndexDerived(store: StateSignals<VaultIndexSlice>) {
  const isIndexProcessActive = computed(
    () => store.vaultIndexProcess().mode !== null && store.vaultIndexProcess().result === null,
  );

  const lastProcessResult = computed(() => store.vaultIndexProcess().result?.status ?? null);

  return {
    isIndexProcessActive,
  };
}
