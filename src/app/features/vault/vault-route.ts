import { CanActivateFn, Route, Router } from '@angular/router';
import { noAuthGuard } from '../../app-route-guards';
import { AppVaultComponent } from './vault';
import { inject } from '@angular/core';
import { StaleAuthorisationTokenError, TestAuthProcess } from '../../processes/test-auth.process';
import { logError } from '../../../services/debug-logger';

export const invalidTokenGuard: CanActivateFn = async (route, state) => {
  const testAuth = inject(TestAuthProcess);
  const router = inject(Router);

  try {
    await testAuth();
  } catch (error) {
    if (error instanceof StaleAuthorisationTokenError) {
      return router.createUrlTree(['/login']);
    }

    logError(error, 'invalidTokenGuard');
  }

  return true;
};

export const vaultRoute: Route = {
  path: 'vault',
  canActivate: [noAuthGuard, invalidTokenGuard],
  component: AppVaultComponent,
};
