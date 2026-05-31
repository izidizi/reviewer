import {
  getState,
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { initialAuthSlice } from './auth.slice';
import { authDerived } from './auth-derived';
import { accessTokenIsReady, accessTokenReset, loadFailed, startLoading } from './auth-updaters';
import { effect } from '@angular/core';

export type AuthStore = InstanceType<typeof AuthStore>;

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialAuthSlice),
  withComputed((store) => authDerived(store)),
  withMethods((store) => {
    return {
      startLoading: () => patchState(store, startLoading()),
      accessTokenIsReady: (accessToken: string) =>
        patchState(store, accessTokenIsReady(accessToken)),
      loadFailed: (error: Error) => patchState(store, loadFailed(error)),
      accessTokenReset: () => patchState(store, accessTokenReset()),
    };
  }),
  withHooks((store) => ({
    onInit: () => {
      const accessTokenKey = 'accessToken';
      const accessToken = localStorage.getItem(accessTokenKey);
      if (accessToken) {
        patchState(store, () => ({
          accessToken,
        }));
      }

      effect(() => {
        const state = getState(store);

        if (state.accessToken) {
          localStorage.setItem(accessTokenKey, state.accessToken);
        } else {
          localStorage.removeItem(accessTokenKey);
        }
      });
    },
  })),
);
