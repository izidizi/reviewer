import { Component, computed, inject } from '@angular/core';
import { VaultStore } from '../../../store/vault/vault.store';
import { StatisticsStore } from '../../../store/statistics/statistics.store';
import { VaultStateStore } from '../../../store/vault-state/vault-state.store';

@Component({
  selector: 'app-index-statistics',
  imports: [],
  styles: `
    :host {
      display: block;
    }
  `,
  template: `
    <p>has changes: {{ vaultStateStrore.hasChanges() ? 'yes' : 'no' }}</p>
    <p>total articles: {{ totalArticles() }}</p>
    <p>total reviewed articles: {{ totalReviewedArticles() }}</p>
    <p>total revies: {{ totalReviews() }}</p>
    <p>avg reviews: {{ avgReviews() }} per article</p>
    <p>reviews queue: {{ reviewsQueue() }}</p>
    <p>reviews dead queue: {{ reviewsDeadQueue() }}</p>
  `,
})
export class IndexStatistics {
  readonly vault = inject(VaultStore);
  readonly statisticsStore = inject(StatisticsStore);
  readonly vaultStateStrore = inject(VaultStateStore);

  readonly totalArticles = computed(() => {
    return Object.keys(this.vault.articlesIndex()).length;
  });
  readonly totalReviewedArticles = computed(() => {
    return Object.keys(this.statisticsStore.articles()).length;
  });
  readonly totalReviews = computed(() => {
    return Object.values(this.vault.reviewsIndex()).reduce(
      (total, reviews) => (total += reviews?.length ?? 0),
      0,
    );
  });
  readonly avgReviews = computed(() => {
    const totalReviewedArticles = this.totalReviewedArticles();
    const totalReviews = this.totalReviews();
    return totalReviewedArticles > 0 ? (totalReviews / totalReviewedArticles).toFixed(2) : 0;
  });

  readonly reviewsQueue = computed(() => this.vaultStateStrore.reviewsQueue().length);
  readonly reviewsDeadQueue = computed(() => this.vaultStateStrore.reviewsDeadQueue().length);
}
