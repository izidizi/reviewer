import { inject, InjectionToken } from '@angular/core';
import { AppRouterStore } from '../../store/app-router/app-router.store';
import { LoadConfigurationProcess } from '../load-configuration.process';
import { loadDefaultVaultProcess } from './load-default-vault.process';
import { Router } from '@angular/router';
import { goToProcess } from './go-to.process';
import { goToLastUrlProcess } from './go-to-last-url.process';

export type GoToProcess = (route: readonly string[]) => Promise<void>;
export const GoToProcess = new InjectionToken<GoToProcess>('GoToProcess', {
  providedIn: 'root',
  factory: () => {
    const appRouterStore = inject(AppRouterStore);
    const router = inject(Router);

    return goToProcess({ appRouterStore, router });
  },
});

export type GoToLastUrlProcess = () => Promise<boolean>;
export const GoToLastUrlProcess = new InjectionToken<GoToLastUrlProcess>('GoToLastUrlProcess', {
  providedIn: 'root',
  factory: () => {
    const appRouterStore = inject(AppRouterStore);
    const goToProcess = inject(GoToProcess);

    return goToLastUrlProcess({ appRouterStore, goToProcess });
  },
});

export type LoadDefaultVaultProcess = () => Promise<void>;
export const LoadDefaultVaultProcess = new InjectionToken<LoadDefaultVaultProcess>(
  'LoadDefaultVaultProcess',
  {
    providedIn: 'root',
    factory: () => {
      const appRouterStore = inject(AppRouterStore);
      const loadConfiguration = inject(LoadConfigurationProcess);
      const goto = inject(GoToProcess);

      return loadDefaultVaultProcess({
        appRouterStore,
        loadConfiguration,
        goto,
      });
    },
  },
);
