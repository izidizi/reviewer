import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AuthStore } from '../../store/auth/auth.store';
import { LoginProcess } from '../../processes/login.process';
import { MatAnchor } from '@angular/material/button';
import { DefaultErrorsProcess } from '../../processes/default-errors.process';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';

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

  async login() {
    try {
      await this.loginProcess();
      this.router.navigate(['vault']);
    } catch (error) {
      if (await this.defaultErrorsProcess(error)) return;

      this.notificationService.showError(error);
    }
  }
}
