import { inject, InjectionToken } from '@angular/core';
import { AuthStore } from '../store/auth/auth.store';
import { ProcessError } from '../../model/error/process-error';

/**
 * @deprecated use CheckAuthBL and UserNotAuthorised error
 */
export class UserNotAuthorisedDeprecated extends ProcessError {
  constructor() {
    super({ process: 'CheckAuthProcess', message: 'user is not authorized' });
  }
}

/**
 * @deprecated use CheckAuthBL
 */
export type CheckAuthProcess = () => Promise<string>;
export const CheckAuthProcess = new InjectionToken<CheckAuthProcess>('CheckAuthProcess', {
  providedIn: 'root',
  factory: () => {
    const authStore = inject(AuthStore);

    return checkAuthProcess({ authStore });
  },
});

function checkAuthProcess({ authStore }: { authStore: AuthStore }): CheckAuthProcess {
  return async () => {
    const accessToken = authStore.accessToken();
    if (!accessToken) {
      // redirect to login
      throw new UserNotAuthorisedDeprecated();
    }

    return accessToken;
  };
}
