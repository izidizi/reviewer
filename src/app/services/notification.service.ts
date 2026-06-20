import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProcessError } from '../../model/error/process-error';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  readonly router = inject(Router);
  readonly snackBar = inject(MatSnackBar);

  readonly eventsSubscription = this.router.events
    .pipe(filter((event) => event instanceof NavigationStart))
    .subscribe(() => {
      this.snackBar.dismiss();
    });

  clear() {
    this.snackBar.dismiss();
  }

  showError(error: unknown) {
    let message: string = 'Operation failed: ';

    if (error instanceof ProcessError) {
      message += error.message;
    } else if (typeof error === 'string') {
      message += error;
    } else {
      message += 'unknown error';
    }

    this.snackBar.open(message, 'Ok');
  }
}
