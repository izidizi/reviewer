import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonAppearance, MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { Router } from '@angular/router';
import { logToConsole } from '../../../services/debug-logger';
import { ConfigurationStore } from '../../store/configuration/configuration.store';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { GoToProcess } from '../../processes/router';
import { VaultStateStore } from '../../store/vault-state/vault-state.store';

@Component({
  selector: 'app-navbar',
  imports: [MatButtonModule, MatBadgeModule],
  templateUrl: 'navbar.html',
  styleUrl: 'navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppNavbarComponent {
  readonly router = inject(Router);
  readonly urlTree = this.router.parseUrl(this.router.url);

  readonly configurationStore = inject(ConfigurationStore);
  readonly exerciseStore = inject(ExerciseStore);
  readonly statisticsStore = inject(StatisticsStore);
  readonly vaultStateStore = inject(VaultStateStore);

  readonly gotoProcess = inject(GoToProcess);

  readonly hasChanges = computed(() => {
    return this.configurationStore.isUpdated() ||
      this.exerciseStore.isUpdated() ||
      this.vaultStateStore.hasChanges()
      ? '+'
      : undefined;
  });

  goto(route: string[]) {
    this.gotoProcess(route);
  }

  buttonStyleFor(route: string): MatButtonAppearance {
    if (`/${route}` === this.router.url) return 'outlined';
    return 'text';
  }

  printLogToConsole() {
    logToConsole();
  }
}
