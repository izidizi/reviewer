import { inject, Injectable } from '@angular/core';
import { AuthStore } from '../app/store/auth/auth.store';
import { registerStore } from './debug-logger';
import { ConfigurationStore } from '../app/store/configuration/configuration.store';
import { ExerciseStore } from '../app/store/exercise/exercise.store';
import { StatisticsStore } from '../app/store/statistics/statistics.store';
import { VaultIndexStore } from '../app/store/vault-index/vault-index.store';
import { AppRouterStore } from '../app/store/app-router/app-router.store';

@Injectable({
  providedIn: 'root',
})
export class DebugService {
  readonly authStore = inject(AuthStore);
  readonly configuration = inject(ConfigurationStore);
  readonly appRouter = inject(AppRouterStore);
  readonly exercise = inject(ExerciseStore);
  readonly statistics = inject(StatisticsStore);
  readonly vaultIndex = inject(VaultIndexStore);

  constructor() {
    registerStore('appRouter', this.appRouter);
    registerStore('auth', this.authStore);
    registerStore('configuration', this.configuration);
    registerStore('exercise', this.exercise);
    registerStore('statistics', this.statistics);
    registerStore('vaultIndex', this.vaultIndex);
  }
}
