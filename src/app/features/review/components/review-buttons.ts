import { Component, input, output, linkedSignal } from '@angular/core';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { isReviewResult, ReviewResult, ReviewResultUnknown } from '../../../model/review-result';

@Component({
  selector: 'app-review-buttons',
  imports: [MatButtonToggleModule],
  styles: [],
  template: `
    <mat-button-toggle-group
      aria-label="Review results"
      [value]="result()"
      [disabled]="isReadonly()"
      (change)="onChange($event)"
    >
      <mat-button-toggle value="positive"> Positive </mat-button-toggle>
      <mat-button-toggle value="incomplete"> Incomplete </mat-button-toggle>
      <mat-button-toggle value="negative"> Negative </mat-button-toggle>
    </mat-button-toggle-group>
  `,
})
export class AppReviewButtonsComponent {
  result = input.required<ReviewResult | null>();
  select = output<ReviewResult>();

  readonly isReadonly = linkedSignal(() => {
    const result = this.result();

    return result !== null && result !== ReviewResultUnknown;
  });

  onChange(event: MatButtonToggleChange) {
    const { value } = event;

    this.isReadonly.set(true);

    if (isReviewResult(value)) {
      this.select.emit(value);
    } else {
      this.select.emit('unknown');
    }
  }
}
