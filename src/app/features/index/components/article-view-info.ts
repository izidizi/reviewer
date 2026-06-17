import { Component, input } from '@angular/core';
import { AppTagComponent } from '../../../components/tag/tag';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-article-view-info',
  imports: [MatIconModule, AppTagComponent],
  styles: `
    :host {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      background-color: var(--mat-sys-surface);
      border-radius: 8px;
      border: 1px solid var(--mat-sys-outline-variant);
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--mat-sys-primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
    }

    .info-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9em;
      font-weight: 600;
      text-transform: uppercase;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--mat-sys-primary);
      }
    }

    .info-value {
      margin: 0.5rem 0 0;
      font-weight: 400;
      word-break: break-word;
    }
  `,
  template: `
    @for (item of info(); track item.title) {
      <div class="info-item">
        <div class="info-header">
          <mat-icon class="material-icons-outlined">{{ item.icon }}</mat-icon>
          <span>{{ item.title }}</span>
        </div>
        <p class="info-value">{{ item.value }}</p>
      </div>
    }
  `,
})
export class ArticleViewInfo {
  readonly info = input.required<ReadonlyArray<{ icon: string; title: string; value: string }>>();
}
