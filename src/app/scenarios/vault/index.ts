import { inject, InjectionToken } from '@angular/core';
import { closeVaultScenario } from './close-vault.scenarion';
import { Router } from '@angular/router';
import { AppRouterStore } from '../../store/app-router/app-router.store';

export type CloseVaultScenario = () => void;
export const CloseVaultScenario = new InjectionToken<CloseVaultScenario>('CloseVaultScenario', {
  providedIn: 'root',
  factory: () => {
    const router = inject(Router);
    const routerStore = inject(AppRouterStore);

    return closeVaultScenario({
      router,
      routerStore,
    });
  },
});
