import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-tag',
  imports: [MatButtonModule, MatIconModule],
  styles: [
    `
      @use '@angular/material' as mat;
      :host {
        @include mat.button-overrides(
          (
            outlined-container-shape: 1.5rem,
          )
        );
      }
    `,
  ],
  template: ` <button matButton="outlined">
    @if (addIcon()) {
      <mat-icon class="material-icons-outlined">tag</mat-icon>
    }
    {{ text() }}
  </button>`,
})
export class AppTagComponent {
  readonly tag = input<string | null>(null);
  readonly topic = input<string | null>(null);

  readonly addIcon = computed(() => this.tag() !== null);
  readonly text = computed(() => {
    const text = this.tag() ?? this.topic() ?? '';

    return this.addIcon() ? text.replace('#', '') : text;
  });
}
