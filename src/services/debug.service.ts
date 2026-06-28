import { inject, Injectable } from '@angular/core';
import { AuthStore } from '../app/store/auth/auth.store';
import { registerStore } from './debug-logger';
import { ConfigurationStore } from '../app/store/configuration/configuration.store';
import { ExerciseStore } from '../app/store/exercise/exercise.store';
import { StatisticsStore } from '../app/store/statistics/statistics.store';
import { AppRouterStore } from '../app/store/app-router/app-router.store';
import { FeatureIndexStore } from '../app/features/index/index.store';
import { VaultStore } from '../app/store/vault/vault.store';
import { VaultStateStore } from '../app/store/vault-state/vault-state.store';
import { CacheStore } from '../app/store/cache/cache.store';
import { IndexVaultStore } from '../app/scenarios/index-vault/index-vault.store';
import { PlanStore } from '../app/store/plan/plan.store';

@Injectable({
  providedIn: 'root',
})
export class DebugService {
  readonly authStore = inject(AuthStore);
  readonly vaultStore = inject(VaultStore);
  readonly vaultStateStore = inject(VaultStateStore);
  readonly cacheStore = inject(CacheStore);
  readonly configuration = inject(ConfigurationStore);
  readonly appRouter = inject(AppRouterStore);
  readonly exercise = inject(ExerciseStore);
  readonly statistics = inject(StatisticsStore);

  readonly featureIndex = inject(FeatureIndexStore);
  readonly indexVault = inject(IndexVaultStore);
  readonly planStore = inject(PlanStore);

  constructor() {
    registerStore('appRouterStore', this.appRouter);
    registerStore('authStore', this.authStore);
    registerStore('vaultStore', this.vaultStore);
    registerStore('vaultStateStore', this.vaultStateStore);
    registerStore('cachedStore', this.cacheStore);
    registerStore('configurationStore', this.configuration);
    registerStore('exerciseStore', this.exercise);
    registerStore('statisticsStore', this.statistics);

    registerStore('featureIndexStore', this.featureIndex);
    registerStore('indexVaultStore', this.indexVault);
    registerStore('planStore', this.planStore);
  }
}
