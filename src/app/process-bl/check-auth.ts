import { inject, InjectionToken } from '@angular/core';
import { AuthStore } from '../store/auth/auth.store';
import { AppError } from '../../model/error/app-error';

export class UserNotAuthorised extends AppError {
  constructor() {
    super('user is not authorized');
  }
}

export type CheckAuthBL = () => Promise<string>;
export const CheckAuthBL = new InjectionToken<CheckAuthBL>('CheckAuthBL', {
  providedIn: 'root',
  factory: () => {
    const authStore = inject(AuthStore);

    return async () => {
      const accessToken = authStore.accessToken();
      if (!accessToken) {
        throw new UserNotAuthorised();
      }

      //TODO: check if token is valid

      return accessToken;
    };
  },
});
