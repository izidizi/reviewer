import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ReviewResult } from '../../../model/review-result';
import { AppArticleReviewResultComponent } from '../../../components/article-review-result/article-review-result';

@Component({
  selector: 'app-article-view-last-result',
  imports: [MatIconModule, AppArticleReviewResultComponent],
  styles: `
    app-article-review-result ::ng-deep mat-icon {
      position: relative;
      top: 3px;
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
    }
    .score-container {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      padding: 1rem;
      margin: 1rem;
      border-radius: 8px;
      border: 1px solid var(--mat-sys-outline-variant);

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
    <div class="score-container">
      <app-article-review-result [result]="lastResult()" />
      <div class="score-content">
        <span class="score-label">Last</span>
        <span class="score-value">{{ nummericValue() }}</span>
      </div>
    </div>
  `,
})
export class ArticleViewLastResult {
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
