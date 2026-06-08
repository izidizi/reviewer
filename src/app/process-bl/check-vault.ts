import { inject, InjectionToken } from '@angular/core';
import { AppError } from '../../model/error/app-error';
import { ConfigurationStore } from '../store/configuration/configuration.store';

export class NoVaultError extends AppError {
  constructor() {
    super('no valut');
  }
}

export type CheckVaultBL = () => void;
export const CheckVaultBL = new InjectionToken<CheckVaultBL>('CheckVaultBL', {
  providedIn: 'root',
  factory: () => {
    const configurationStore = inject(ConfigurationStore);

    return async () => {
      const isLoaded = configurationStore.isLoaded();
      if (!isLoaded) {
        throw new NoVaultError();
      }
    };
  },
});
