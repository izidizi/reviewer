import {
  getState,
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { effect } from '@angular/core';
import { initialConfigurationSlice } from './configuration.slice';
import { parsePath, Path } from '../../model/path';
import * as updaters from './configuration.updaters';

export type ConfigurationStore = InstanceType<typeof ConfigurationStore>;

export const ConfigurationStore = signalStore(
  { providedIn: 'root' },
  withState(initialConfigurationSlice),
  withMethods((store) => {
    return {
      setInitialConfiguration: (configurationPath: Path, configurationName: string) =>
        patchState(store, updaters.setInitialConfiguration(configurationPath, configurationName)),
      loadConfiguration: (data: updaters.LoadConfigurationData) =>
        patchState(store, updaters.loadConfiguration(data)),
      setVaultConfiguration: (data: updaters.SetVaultConfigurationData) =>
        patchState(store, updaters.setVaultConfiguration(data)),
      pathVaultConfiguration: (data: updaters.PathVaultConfigurationData) =>
        patchState(store, updaters.pathVaultConfiguration(data)),
      resetIsUpdated: () => patchState(store, updaters.resetIsUpdated()),
      patchPath: (path: Path) => patchState(store, updaters.patchPath(path)),
    };
  }),
  withHooks((store) => ({
    onInit: () => {
      const configurationPathKey = 'vaultPath';
      const vaultPath = localStorage.getItem(configurationPathKey);
      if (!vaultPath) return;
      const path = parsePath(vaultPath);
      const configurationPath = path.slice(0, -1);
      const configurationName = path.pop();
      if (!configurationName) return;

      store.setInitialConfiguration(configurationPath, configurationName);

      effect(() => {
        const state = getState(store);

        // if (state.accessToken) {
        //   localStorage.setItem(accessTokenKey, state.accessToken);
        // } else {
        //   localStorage.removeItem(accessTokenKey);
        // }
      });
    },
  })),
);
