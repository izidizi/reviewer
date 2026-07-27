import { inject, InjectionToken } from '@angular/core';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { createPlanProcess } from './create-plan.process';
import { VaultStore } from '../../store/vault/vault.store';
import { PlanStore } from '../../store/plan/plan.store';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { createConsolidationPlanProcess } from './create-consolidation-plan.process';

export type CreatePlanProcess = (configuration?: { forseRecreate: boolean }) => void;
export const CreatePlanProcess = new InjectionToken<CreatePlanProcess>('CreatePlanProcess', {
  providedIn: 'root',
  factory: () => {
    const vaultStore = inject(VaultStore);
    const statisticsStore = inject(StatisticsStore);
    const exerciseStore = inject(ExerciseStore);
    const planStore = inject(PlanStore);

    return createPlanProcess({ vaultStore, statisticsStore, exerciseStore, planStore });
  },
});

export type CreateConsolidationPlanProcess = (configuration?: { forceRecreate: boolean }) => void;
export const CreateConsolidationPlanProcess = new InjectionToken<CreateConsolidationPlanProcess>(
  'CreateConsolidationPlanProcess',
  {
    providedIn: 'root',
    factory: () => {
      const vaultStore = inject(VaultStore);
      const statisticsStore = inject(StatisticsStore);
      const exerciseStore = inject(ExerciseStore);
      const planStore = inject(PlanStore);

      return createConsolidationPlanProcess({
        vaultStore,
        statisticsStore,
        exerciseStore,
        planStore,
      });
    },
  },
);
