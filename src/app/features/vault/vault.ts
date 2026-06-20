import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { VaultService } from './vault.service';
import { LoadConfigurationProcess } from '../../processes/load-configuration.process';
import { parsePath } from '../../model/path';
import { NotificationService } from '../../services/notification.service';
import { logAction, logError } from '../../../services/debug-logger';
import { DefaultErrorsProcess } from '../../processes/default-errors.process';
import { ConfigurationService } from '../../../services/configuration.service';
import { GoToLastUrlProcess, GoToProcess, LoadDefaultVaultProcess } from '../../processes/router';
import { AppRouterStore } from '../../store/app-router/app-router.store';

const place = 'AppVaultComponent';
@Component({
  selector: 'app-vault',
  imports: [MatCardModule, MatListModule, MatButtonModule, MatInputModule, MatFormFieldModule],
  providers: [VaultService],
  templateUrl: './vault.html',
  styleUrl: './vault.scss',
})
export class AppVaultComponent implements OnInit {
  readonly appRouterStore = inject(AppRouterStore);
  readonly loadDefaultVault = inject(LoadDefaultVaultProcess);
  readonly loadConfigurationProcess = inject(LoadConfigurationProcess);
  readonly defaultErrorProcess = inject(DefaultErrorsProcess);
  readonly goToLastUrl = inject(GoToLastUrlProcess);
  readonly goto = inject(GoToProcess);

  readonly vaultService = inject(VaultService);
  readonly isLoading = signal<boolean>(false);

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

  async ngOnInit() {
    this.isLoading.set(true);

    await this.loadDefaultVault().catch((error) => {
      logError(error, `${place}/ngOnInit`);
    });

    this.isLoading.set(false);
  }

  chooseVault(path: string) {
    logAction('choose vault', place, { entity: path });

    this.isLoading.set(true);
    this.loadConfigurationProcess(parsePath(path), 'vault.zip')
      .then(async () => {
        this.appRouterStore.patchVault(path);
        if ((await this.goToLastUrl()) === false) this.goto(['plan']);
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
