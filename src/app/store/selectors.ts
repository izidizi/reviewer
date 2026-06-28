import { computed, inject, Injectable } from '@angular/core';
import { VaultStore } from './vault/vault.store';
import { VaultStateStore } from './vault-state/vault-state.store';
import { ConfigurationStore } from './configuration/configuration.store';
import { ExerciseStore } from './exercise/exercise.store';

@Injectable({
  providedIn: 'root',
})
export class Selectors {
  readonly vaultStore = inject(VaultStore);
  readonly vaultStateStore = inject(VaultStateStore);
  readonly configurationStore = inject(ConfigurationStore);
  readonly exerciseStore = inject(ExerciseStore);

  readonly hasChanges = computed(
    () =>
      this.vaultStateStore.hasChanges() ||
      this.configurationStore.isUpdated() ||
      this.exerciseStore.isUpdated(),
  );
}
