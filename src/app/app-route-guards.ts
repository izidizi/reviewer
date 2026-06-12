import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './store/auth/auth.store';
import { ConfigurationStore } from './store/configuration/configuration.store';
import { logDebug } from '../services/debug-logger';

export const loginGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthed() === false) {
    return true;
  }

  return router.createUrlTree(['/']);
};

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  logDebug('auth check', {
    includeStack: true,
    entity: `url: ${route.url.map(({ path }) => path).join('/')}`,
    payload: {
      tokenIsNotNull: authStore.accessToken() != null,
      callState: authStore.callState(),
      isAuthed: authStore.isAuthed(),
      isPending: authStore.isPending(),
    },
  });

  if (authStore.isAuthed()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const noVaultGuard: CanActivateFn = (route, state) => {
  const configurationStore = inject(ConfigurationStore);
  const router = inject(Router);

  if (configurationStore.isLoaded()) {
    return true;
  }

  return router.createUrlTree(['/vault']);
};
