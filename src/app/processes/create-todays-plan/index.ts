import { inject, InjectionToken } from '@angular/core';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { VaultIndexStore } from '../../store/vault-index/vault-index.store';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { createTodaysPlanProcess } from './create-todays-plan.process';

export type CreateTodaysPlan = () => void;
export const CreateTodaysPlan = new InjectionToken<CreateTodaysPlan>('CreateTodaysPlan', {
  providedIn: 'root',
  factory: () => {
    const vaultIndexStore = inject(VaultIndexStore);
    const statisticsStore = inject(StatisticsStore);
    const exerciseStore = inject(ExerciseStore);

    return createTodaysPlanProcess({ vaultIndexStore, statisticsStore, exerciseStore });
  },
});
