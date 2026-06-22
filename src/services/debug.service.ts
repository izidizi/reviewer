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

  constructor() {
    registerStore('appRouter', this.appRouter);
    registerStore('auth', this.authStore);
    registerStore('vault', this.vaultStore);
    registerStore('vaultStateStore', this.vaultStateStore);
    registerStore('cached', this.cacheStore);
    registerStore('configuration', this.configuration);
    registerStore('exercise', this.exercise);
    registerStore('statistics', this.statistics);

    registerStore('featureIndex', this.featureIndex);
  }
}
