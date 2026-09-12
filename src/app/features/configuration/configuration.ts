import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AppVaultConfigurationComponent } from './vault-configuration';
import { AppReviewConfigurationComponent } from './review-configuration';
import { AppVaultSaveComponent } from './vault-save';
import { ConfigurationService } from '../../../services/configuration.service';
import { CloseVaultScenario } from '../../scenarios/vault';

const place = 'AppConfigurationComponent';
@Component({
  selector: 'app-configuration',
  imports: [
    AppVaultConfigurationComponent,
    AppReviewConfigurationComponent,
    AppVaultSaveComponent,
    MatButtonModule,
  ],
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    p.close {
      margin: 0;
      text-align: center;
    }
  `,
  template: `
    <app-vault-configuration />
    <app-review-configuration />
    <app-vault-save />
    <p>{{ version() }}:{{ env() }}</p>
    <p class="close"><button mat-button (click)="closeVault()">Close vault</button></p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppConfigurationComponent {
  readonly configurationService = inject(ConfigurationService);
  readonly closeVault = inject(CloseVaultScenario);

  readonly version = this.configurationService.version;
  readonly env = computed<string>(() => {
    let env = '[no env]';
    try {
      env = this.configurationService.env();
    } catch (error) {}
    return env;
  });
}
