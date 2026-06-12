import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { VaultService } from './vault.service';
import { LoadConfigurationProcess } from '../../processes/load-configuration.process';
import { parsePath } from '../../model/path';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { logAction, logError } from '../../../services/debug-logger';
import { DefaultErrorsProcess } from '../../processes/default-errors.process';
import { ConfigurationService } from '../../../services/configuration.service';

const place = 'AppVaultComponent';
@Component({
  selector: 'app-vault',
  imports: [MatCardModule, MatListModule, MatButtonModule, MatInputModule, MatFormFieldModule],
  providers: [VaultService],
  templateUrl: './vault.html',
  styleUrl: './vault.scss',
})
export class AppVaultComponent {
  private router = inject(Router);
  readonly loadConfigurationProcess = inject(LoadConfigurationProcess);
  readonly defaultErrorProcess = inject(DefaultErrorsProcess);

  readonly vaultService = inject(VaultService);
  readonly isLoading = signal<boolean>(false);
  readonly vault = signal<string | null>(null);

  readonly notificationService = inject(NotificationService);
  readonly configurationService = inject(ConfigurationService);

  readonly version = this.configurationService.version;
  readonly env = computed<string>(() => {
    let env = '[no env]';
    try {
      env = this.configurationService.env();
    } catch (error) {}
    return env;
  });

  addVault(vault: string) {
    this.vaultService.addVault(vault);
  }

  chooseVault(path: string) {
    logAction('choose vault', place, { entity: path });

    this.isLoading.set(true);
    this.vault.set(path);

    this.loadConfigurationProcess(parsePath(path), 'vault.zip')
      .then(() => {
        this.router.navigate(['plan']);
      })
      .catch(async (error) => {
        logError(error, `${place}/choose vault`);
        if (await this.defaultErrorProcess(error)) return;

        this.notificationService.showError(error);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }
}
