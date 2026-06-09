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
import { AppScoreComponent } from './features/score/score';

export const routes: Routes = [
  {
    path: '',
    component: AppTargetLayout,
    children: [
      { path: 'vault', canActivate: [noAuthGuard], component: AppVaultComponent },
      { path: 'login', canActivate: [loginGuard], component: AppLoginComponent },
    ],
  },
  {
    path: '',
    component: AppMainLayout,
    canActivate: [noAuthGuard, noVaultGuard],
    children: [
      { path: '', component: AppIndexComponent },
      { path: 'debug', component: AppDebugComponent },
      { path: 'score', component: AppScoreComponent },
      { path: 'plan', component: AppPlanComponent },
      { path: 'configuration', component: AppConfigurationComponent },
    ],
  },
  {
    path: '**',
    component: AppMainLayout,
    canActivate: [noAuthGuard, noVaultGuard],
    children: [{ path: '', component: AppReviewComponent }],
  },
];
