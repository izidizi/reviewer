import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppVaultConfigurationComponent } from './vault-configuration';
import { AppReviewConfigurationComponent } from './review-configuration';
import { AppVaultSaveComponent } from './vault-save';

const place = 'AppConfigurationComponent';
@Component({
  selector: 'app-configuration',
  imports: [AppVaultConfigurationComponent, AppReviewConfigurationComponent, AppVaultSaveComponent],
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  `,
  template: `
    <app-vault-configuration />
    <app-review-configuration />
    <app-vault-save />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppConfigurationComponent {}
