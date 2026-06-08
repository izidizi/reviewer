import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

import { ConfigurationStore } from '../../store/configuration/configuration.store';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { MatCardModule } from '@angular/material/card';
import { parsePath } from '../../model/path';
import { logAction } from '../../../services/debug-logger';

const place = 'AppVaultConfigurationComponent';
@Component({
  selector: 'app-vault-configuration',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
  ],
  styles: `
    mat-form-field {
      width: 30rem;
    }
  `,
  template: `
    <form [formGroup]="vaultConfigurationForm" (ngSubmit)="onVaultConfigurationSave()">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Vault configuration</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-form-field appearance="outline">
            <mat-label>Valut index path</mat-label>
            <input matInput formControlName="path" />
            @if (
              vaultConfigurationForm.get('path')?.hasError('required') &&
              vaultConfigurationForm.get('path')?.touched
            ) {
              <mat-error>The path is required</mat-error>
            }
          </mat-form-field>
        </mat-card-content>
        <mat-card-actions>
          <button
            type="submit"
            matButton
            [disabled]="vaultConfigurationForm.invalid || vaultConfigurationForm.pristine"
          >
            Save
          </button>
          <button
            type="button"
            matButton
            [disabled]="vaultConfigurationForm.pristine"
            (click)="onVaultConfigurationReset()"
          >
            Reset
          </button>
        </mat-card-actions>
      </mat-card>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppVaultConfigurationComponent {
  readonly configurationStore = inject(ConfigurationStore);
  readonly exerciseStore = inject(ExerciseStore);

  readonly vaultConfigurationForm: FormGroup = inject(FormBuilder).group({
    path: new FormControl('', [Validators.required]),
  });

  readonly configurationFormEffect = effect(() => {
    if (!this.vaultConfigurationForm.pristine) return;
    this.resetForm();
  });

  onVaultConfigurationSave(): void {
    if (this.vaultConfigurationForm.valid) {
      logAction('save vault configuration form', place, {
        payload: this.vaultConfigurationForm.value,
      });
      const path = parsePath(this.vaultConfigurationForm.get('path')?.value);
      this.configurationStore.pathVaultConfiguration({ path });

      this.resetForm();
    }
  }

  onVaultConfigurationReset(): void {
    logAction('reset vault configuration form', place);
    this.resetForm();
  }

  resetForm() {
    this.vaultConfigurationForm.reset();
    const path = this.configurationStore.path().join('/');
    this.vaultConfigurationForm.patchValue({ path });
  }
}
