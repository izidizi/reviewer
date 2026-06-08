import { inject, InjectionToken } from '@angular/core';
import { LogoutProcess } from './logout.process';
import { NoVaultError } from '../process-bl/check-vault';
import { Router } from '@angular/router';
import { UserNotAuthorisedDeprecated } from './check-auth.process';
import { UserNotAuthorised } from '../process-bl';

export type DefaultErrorsProcess = (error: unknown) => Promise<boolean>;
export const DefaultErrorsProcess = new InjectionToken<DefaultErrorsProcess>(
  'DefaultErrorsProcess',
  {
    providedIn: 'root',
    factory: () => {
      const rounter = inject(Router);
      const logoutProcess = inject(LogoutProcess);

      return async (error) => {
        if (error instanceof UserNotAuthorised || error instanceof UserNotAuthorisedDeprecated) {
          await logoutProcess();
          return true;
        } else if (error instanceof NoVaultError) {
          await rounter.navigate(['vault']);
          return true;
        }

        return false;
      };
    },
  },
);
