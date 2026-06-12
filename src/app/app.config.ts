import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideMarkdown } from 'ngx-markdown';

import { routes } from './app-routes';
import { ConfigurationService } from '../services/configuration.service';
import { DebugService } from '../services/debug.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimations(),
    provideMarkdown(),

    provideAppInitializer(() => {
      const debugService = inject(DebugService);
      const configurationService = inject(ConfigurationService);
      return configurationService.init();
    }),
  ],
};
