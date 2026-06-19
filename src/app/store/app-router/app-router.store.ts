import {
  getState,
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { initialAppRouterSlice, isAppRouterState } from './app-router.slice';
import { patchLastUrl, patchVault } from './app-router.updaters';
import { effect } from '@angular/core';
import { logError } from '../../../services/debug-logger';

export type AppRouterStore = InstanceType<typeof AppRouterStore>;

export const AppRouterStore = signalStore(
  { providedIn: 'root' },
  withState(initialAppRouterSlice),
  withMethods((store) => {
    return {
      patchVault: (vault: string) => patchState(store, patchVault({ vault })),
      patchLastUrl: (lastUrl: string) => patchState(store, patchLastUrl({ lastUrl })),
    };
  }),
  withHooks((store) => ({
    onInit: () => {
      const storageKey = 'router';

      try {
        const storageData = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
        if (isAppRouterState(storageData)) {
          patchState(store, () => storageData);
        }
      } catch (error) {
        logError(error, 'AppRouterStore - load state from localStorage');
      }

      effect(() => {
        const state = getState(store);
        localStorage.setItem(storageKey, JSON.stringify(state));
      });
    },
  })),
);
