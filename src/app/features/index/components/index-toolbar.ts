import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ConfigurationStore } from '../../../store/configuration/configuration.store';
import { NotificationService } from '../../../services/notification.service';
import { VaultIndexAllProcess, VaultIndexMissingProcess } from '../../../processes/vault';
import { createPath } from '../../../model/path';
import { DefaultErrorsProcess } from '../../../processes/default-errors.process';

@Component({
  selector: 'app-index-toolbar',
  imports: [MatIconModule, MatButtonModule, MatToolbarModule],

  styles: `
    .spacer {
      flex: 1 1 auto;
    }
  `,
  template: `
    <mat-toolbar>
      <mat-toolbar-row>
        <span>{{ title() }}</span>
        <span class="spacer"></span>
        <button
          matIconButton
          class="material-icons-outlined"
          aria-label="Index vault"
          (click)="onRefresh()"
        >
          <mat-icon>refresh</mat-icon>
        </button>
      </mat-toolbar-row>
    </mat-toolbar>
  `,
})
export class AppIndexToolbar {
  readonly configurationStore = inject(ConfigurationStore);
  readonly indexVaultProcess = inject(VaultIndexAllProcess);
  readonly vaultIndexMissingProcess = inject(VaultIndexMissingProcess);
  readonly defaultErrorProcess = inject(DefaultErrorsProcess);
  readonly notificationService = inject(NotificationService);

  readonly title = computed(() => {
    return `Vault: ${createPath(this.configurationStore.vaultRootPath())}`;
  });

  onRefresh() {
    const reindexThreshold = Date.now() - 14 * 24 * 60 * 60 * 1000;
    this.vaultIndexMissingProcess({
      reindexArticlesWithInvalidIndexDate: true,
      reindexArticlesOlderThan: new Date(reindexThreshold),
    }).catch(async (error) => {
      if (await this.defaultErrorProcess(error)) return;

      this.notificationService.showError(error);
    });
  }
}
