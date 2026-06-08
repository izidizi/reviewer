import { Routes } from '@angular/router';
import { AppDebugComponent } from './features/debug/debug';
import { AppReviewComponent } from './features/review/review';
import { AppTargetLayout } from './layouts/target/target.layout';
import { AppLoginComponent } from './features/login/login';
import { AppVaultComponent } from './features/vault/vault';
import { AppMainLayout } from './layouts/main/main.layout';
import { AppPlanComponent } from './features/plan/plan';
import { loginGuard, noAuthGuard, noVaultGuard } from './app-route-guards';
import { AppIndexComponent } from './features/index';
import { AppConfigurationComponent } from './features/configuration/configuration';

export const routes: Routes = [
  {
    path: '',
    canActivate: [noAuthGuard, noVaultGuard],
    component: AppMainLayout,
    children: [
      {
        path: '',
        component: AppIndexComponent,
      },
    ],
  },
  {
    path: 'debug',
    component: AppMainLayout,
    children: [
      {
        path: '',
        component: AppDebugComponent,
      },
    ],
  },
  {
    path: 'vault',
    component: AppTargetLayout,
    canActivate: [noAuthGuard],
    children: [
      {
        path: '',
        component: AppVaultComponent,
      },
    ],
  },
  {
    path: 'login',
    canActivate: [loginGuard],
    component: AppTargetLayout,
    children: [
      {
        path: '',
        component: AppLoginComponent,
      },
    ],
  },
  {
    path: 'plan',
    component: AppMainLayout,
    canActivate: [noAuthGuard, noVaultGuard],
    children: [{ path: '', component: AppPlanComponent }],
  },
  {
    path: 'configuration',
    component: AppMainLayout,
    canActivate: [noAuthGuard, noVaultGuard],
    children: [{ path: '', component: AppConfigurationComponent }],
  },
  {
    path: '**',
    component: AppMainLayout,
    canActivate: [noAuthGuard, noVaultGuard],
    children: [
      {
        path: '',
        component: AppReviewComponent,
      },
    ],
  },
];
