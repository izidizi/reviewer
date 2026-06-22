import { inject, InjectionToken } from '@angular/core';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { createTodaysPlanProcess } from './create-todays-plan.process';
import { VaultStore } from '../../store/vault/vault.store';

export type CreateTodaysPlanProcess = () => void;
export const CreateTodaysPlanProcess = new InjectionToken<CreateTodaysPlanProcess>(
  'CreateTodaysPlan',
  {
    providedIn: 'root',
    factory: () => {
      const vaultStore = inject(VaultStore);
      const statisticsStore = inject(StatisticsStore);
      const exerciseStore = inject(ExerciseStore);

      return createTodaysPlanProcess({ vaultStore, statisticsStore, exerciseStore });
    },
  },
);
