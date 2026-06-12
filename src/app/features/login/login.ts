import { Component, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AuthStore } from '../../store/auth/auth.store';
import { LoginProcess } from '../../processes/login.process';
import { MatAnchor } from '@angular/material/button';
import { DefaultErrorsProcess } from '../../processes/default-errors.process';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { ConfigurationService } from '../../../services/configuration.service';
import { logError } from '../../../services/debug-logger';

@Component({
  selector: 'app-login',
  imports: [MatCardModule, MatAnchor],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class AppLoginComponent {
  readonly router = inject(Router);
  readonly authState = inject(AuthStore);
  readonly loginProcess = inject(LoginProcess);
  readonly defaultErrorsProcess = inject(DefaultErrorsProcess);
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

  async login() {
    try {
      await this.loginProcess();
      this.router.navigate(['vault']);
    } catch (error) {
      logError(error, `AppLoginComponent/login`);
      if (await this.defaultErrorsProcess(error)) return;

      this.notificationService.showError(error);
    }
  }
}
