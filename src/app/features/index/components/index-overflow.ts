import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-index-overflow',
  imports: [MatButtonModule],
  styles: `
    :host {
      display: block;
      text-align: center;
      margin: 5rem 0;
    }
  `,
  template: `
    <p>{{ indexRecords() }} is too many records, max is {{ maxIndexRecords() }}</p>
    <p><button matButton type="button" (click)="renderRecords.emit()">Render records</button></p>
  `,
})
export class IndexOverflow {
  readonly indexRecords = input.required<number>();
  readonly maxIndexRecords = input.required<number>();

  readonly renderRecords = output();
}
