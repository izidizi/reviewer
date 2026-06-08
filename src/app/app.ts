import { Component, HostListener, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '../services/theme/theme.service';
import { StatisticsStore } from './store/statistics/statistics.store';
import { VaultIndexStore } from './store/vault-index/vault-index.store';
import { ConfigurationStore } from './store/configuration/configuration.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  readonly themeService = inject(ThemeService);
  readonly statisticsStore = inject(StatisticsStore);
  readonly vaultIndexStore = inject(VaultIndexStore);
  readonly configurationStore = inject(ConfigurationStore);

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: BeforeUnloadEvent): void {
    if (
      this.statisticsStore.isUpdated() ||
      this.vaultIndexStore.isUpdated() ||
      this.configurationStore.isUpdated()
    ) {
      $event.preventDefault();
    }
  }

  ngOnInit(): void {
    // this.themeService.colorSchemeLight();
    // this.themeService.colorSchemeDark();
  }
}
