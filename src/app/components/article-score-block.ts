import { Component, computed, input } from '@angular/core';
import { AppArticleScoreComponent } from './article-score/article-score';

@Component({
  selector: 'app-article-score-block',
  imports: [AppArticleScoreComponent],
  styles: [
    `
      :host {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        padding: 1rem;
        margin: 1rem;
        border-radius: 8px;
        border: 1px solid var(--mat-sys-outline-variant);

        app-article-score {
          position: relative;
          top: 3px;

          ::ng-deep mat-icon {
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
  ],
  template: `
    <app-article-score [score]="score()" />
    <div class="score-content">
      <span class="score-label">Score</span>
      <span class="score-value">{{ scoreValue() }}</span>
    </div>
  `,
})
export class AppArticleScoreBlockComponent {
  readonly score = input<number | null | undefined>(null);

  readonly scoreValue = computed(() => {
    const score = this.score();
    if (score == null) return '--';
    return score.toFixed(1);
  });
}
