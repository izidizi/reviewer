import { Component, inject } from '@angular/core';
import { LoginProcess } from '../../processes/login.process';
import { AuthStore } from '../../store/auth/auth.store';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class AppLoginComponent {
  readonly authState = inject(AuthStore);
  readonly loginProcess = inject(LoginProcess);
}
