import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { VaultArticleStatistics } from '../../../model/vault-article-statistics';

@Component({
  selector: 'app-article-view-review-statistics',
  imports: [MatIconModule],
  styles: `
    .statistics-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1.5rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 0 1rem 1rem;
      border-radius: 8px;
      border: 1px solid var(--mat-sys-outline-variant);
      border-left: 4px solid;
      background-color: var(--mat-sys-surface-container-lowest);
      transition: all 0.2s ease;

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      &.positive {
        border-left: 4px solid var(--color-good);

        mat-icon {
          color: var(--color-good);
        }
      }

      &.incomplete {
        border-left: 4px solid var(--color-normal);

        mat-icon {
          color: var(--color-normal);
        }
      }

      &.negative {
        border-left: 4px solid var(--color-bad);

        mat-icon {
          color: var(--color-bad);
        }
      }

      &:hover {
        border-color: var(--mat-sys-primary);
      }
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .stat-label {
        font-size: 0.8rem;
        text-transform: uppercase;
        font-weight: 600;
      }
      .stat-value {
        font-size: 24px;
        font-weight: 700;
      }
    }
  `,
  template: `
    <div class="statistics-container">
      <div class="stat-item total">
        <mat-icon class="material-icons-outlined">assessment</mat-icon>
        <div class="stat-content">
          <span class="stat-label">Total</span>
          <span class="stat-value">{{ total() }}</span>
        </div>
      </div>
      <div class="stat-item positive">
        <mat-icon class="material-icons-outlined">thumb_up</mat-icon>
        <div class="stat-content">
          <span class="stat-label">Positive</span>
          <span class="stat-value">{{ positive() }}</span>
        </div>
      </div>
      <div class="stat-item incomplete">
        <mat-icon class="material-icons-outlined">warning_amber</mat-icon>
        <div class="stat-content">
          <span class="stat-label">Incomplete</span>
          <span class="stat-value">{{ incomplete() }}</span>
        </div>
      </div>
      <div class="stat-item negative">
        <mat-icon class="material-icons-outlined">priority_high</mat-icon>
        <div class="stat-content">
          <span class="stat-label">Negative</span>
          <span class="stat-value">{{ negative() }}</span>
        </div>
      </div>
    </div>
  `,
})
export class ArticleViewReviewStatistics {
  readonly statistics = input.required<VaultArticleStatistics['total']>();
  readonly hasUnknonwn = computed(() => this.statistics().unknown > 0);
  readonly total = computed(
    () => this.statistics().positive + this.statistics().negative + this.statistics().incomplete,
  );
  readonly positive = computed(() => this.statistics().positive);
  readonly incomplete = computed(() => this.statistics().incomplete);
  readonly negative = computed(() => this.statistics().negative);
}
