import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AppArticleReviewResultComponent } from './article-review-result/article-review-result';
import { ReviewResult } from '../model/review-result';

@Component({
  selector: 'app-article-last-result-block',
  imports: [MatIconModule, AppArticleReviewResultComponent],
  styles: `
    :host {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      padding: 1rem;
      margin: 1rem;
      border-radius: 8px;
      border: 1px solid var(--mat-sys-outline-variant);

      app-article-review-result {
        ::ng-deep mat-icon {
          position: relative;
          top: 3px;
          font-size: 3rem;
          width: 3rem;
          height: 3rem;
        }
      }

      .score-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        .score-label {
          text-transform: uppercase;
          font-weight: 600;
        }
        .score-value {
          font-size: 1.6rem;
          font-weight: 600;
        }
      }
    }
  `,
  template: `
    <app-article-review-result [result]="lastResult()" />
    <div class="score-content">
      <span class="score-label">Last</span>
      <span class="score-value">{{ nummericValue() }}</span>
    </div>
  `,
})
export class AppArticleLastResultBlockComponent {
  readonly lastResult = input.required<ReviewResult | null>();
  readonly nummericValue = computed(() => {
    const result = this.lastResult();
    return result === 'negative'
      ? '1.0'
      : result === 'incomplete'
        ? '3.0'
        : result === 'positive'
          ? '5.0'
          : '--';
  });
}
