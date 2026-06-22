import { Component, HostListener, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '../services/theme/theme.service';
import { ConfigurationStore } from './store/configuration/configuration.store';
import { VaultStateStore } from './store/vault-state/vault-state.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  readonly themeService = inject(ThemeService);
  readonly vaultStateStore = inject(VaultStateStore);
  readonly configurationStore = inject(ConfigurationStore);

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: BeforeUnloadEvent): void {
    if (this.vaultStateStore.hasChanges() || this.configurationStore.isUpdated()) {
      $event.preventDefault();
    }
  }

  ngOnInit(): void {
    // this.themeService.colorSchemeLight();
    this.themeService.colorSchemeDark();
  }
}
