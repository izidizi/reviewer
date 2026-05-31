import { inject, InjectionToken } from '@angular/core';
import { AuthStore } from '../store/auth/auth.store';
import { ProcessError } from '../../model/error/process-error';

export class UserNotAuthorised extends ProcessError {
  constructor() {
    super({ process: 'CheckAuthProcess', message: 'user is not authorized' });
  }
}

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
      throw new UserNotAuthorised();
    }

    return accessToken;
  };
}
