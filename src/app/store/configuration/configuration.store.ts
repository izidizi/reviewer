import {
  getState,
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { effect } from '@angular/core';
import { ConfigurationSlice, initialConfigurationSlice } from './configuration.slice';
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
      setConfiguration: (
        configuration: Pick<
          ConfigurationSlice,
          'path' | 'configurationPathDriveId' | 'configurationNameDriveId'
        >,
      ) => patchState(store, updaters.setConfiguration(configuration)),
    };
  }),
  withHooks((store) => ({
    onInit: () => {
      const configurationPathKey = 'vaultPath';
      const vaultPath = localStorage.getItem(configurationPathKey);
      if (!vaultPath) {
        console.log('no app configuration found');
        return;
      }
      const path = parsePath(vaultPath);
      const configurationPath = path.slice(0, -1);
      const configurationName = path.pop();
      if (!configurationName) {
        console.log('not app configuration found (name)');
        return;
      }

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
