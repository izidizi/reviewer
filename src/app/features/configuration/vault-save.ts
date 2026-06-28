import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { ConfigurationStore } from '../../store/configuration/configuration.store';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { MatCardModule } from '@angular/material/card';
import { logAction, logError } from '../../../services/debug-logger';
import { SaveConfigufationProcess } from '../../processes/save-configuration.process';
import { DefaultErrorsProcess } from '../../processes/default-errors.process';
import { NotificationService } from '../../services/notification.service';
import { VaultStateStore } from '../../store/vault-state/vault-state.store';

const place = 'AppVaultSaveComponent';
@Component({
  selector: 'app-vault-save',
  imports: [MatCardModule, MatButtonModule],
  styles: `
    mat-card-actions {
      text-align: center;
    }
  `,
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title>Vault configuration</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Vault configuration changes: {{ configurationStore.isUpdated() ? 'yes' : 'no' }}</p>
        <p>Vault index changes: {{ vaultStateStore.hasChanges() ? 'yes' : 'no' }}</p>
        <p>Review configuration changes: {{ exerciseStore.isUpdated() ? 'yes' : 'no' }}</p>
        <p>Statistics changes: {{ vaultStateStore.hasChanges() ? 'yes' : 'no' }}</p>
      </mat-card-content>
      <mat-card-actions>
        <button type="button" matButton (click)="onVaultSave()">Save</button>
      </mat-card-actions>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppVaultSaveComponent {
  readonly notificationService = inject(NotificationService);
  readonly configurationStore = inject(ConfigurationStore);
  readonly exerciseStore = inject(ExerciseStore);
  readonly vaultStateStore = inject(VaultStateStore);

  readonly saveConfigurationProcess = inject(SaveConfigufationProcess);
  readonly defaultErrorsProcess = inject(DefaultErrorsProcess);

  onVaultSave(): void {
    logAction('save vault configuration form', place);

    this.saveConfigurationProcess().catch(async (error) => {
      logError(error, place);

      if (await this.defaultErrorsProcess(error)) return;

      this.notificationService.showError(error);
    });
  }
}
