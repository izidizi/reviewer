import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { AppVaultConfigurationComponent } from './vault-configuration';
import { AppReviewConfigurationComponent } from './review-configuration';
import { AppVaultSaveComponent } from './vault-save';
import { ConfigurationService } from '../../../services/configuration.service';

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
    <p>{{ version() }}:{{ env() }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppConfigurationComponent {
  readonly configurationService = inject(ConfigurationService);

  readonly version = this.configurationService.version;
  readonly env = computed<string>(() => {
    let env = '[no env]';
    try {
      env = this.configurationService.env();
    } catch (error) {}
    return env;
  });
}
