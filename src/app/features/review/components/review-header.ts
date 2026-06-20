import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-review-header',
  imports: [MatIconModule, MatButtonModule],
  styles: [
    `
      :host {
        display: flex;
        width: 100%;
        align-items: center;

        .spacer {
          flex: 1 1 auto;
        }
      }
    `,
  ],
  template: `
    <span>{{ title() }}</span>
    <span class="spacer"></span>
    <button
      matIconButton
      class="material-icons-outlined"
      aria-label="Exit review"
      (click)="close.emit()"
    >
      <mat-icon>close</mat-icon>
    </button>
  `,
})
export class AppReviewHeaderComponent {
  readonly title = input.required<string>();
  readonly close = output<void>();
}
