import { Component, computed, inject, input } from '@angular/core';
import { ArticleId } from '../../../model/article-id';
import { VaultIndexStore } from '../../../store/vault-index/vault-index.store';
import { ArticleMoveToComponent } from './move-to';
import { StatisticsStore } from '../../../store/statistics/statistics.store';
import { MatCardModule } from '@angular/material/card';
import { ArticleView } from './article-view';
import { isValidDate } from '../../../../model/utils/invalid-date';
import { formatDate } from '../../../helpers';

@Component({
  selector: 'app-index-article-details',
  imports: [ArticleMoveToComponent, MatCardModule, ArticleView],
  styles: `
    :host {
      min-height: 0;
    }
  `,
  template: `
    <mat-card appearance="outlined">
      <app-article-view
        [articleId]="articleId()"
        [tags]="tags()"
        [topics]="topics()"
        [statistics]="statisitcs()"
        [score]="score()"
        [created]="created()"
        [indexed]="indexed()"
        [lastResult]="lastResult()"
        [lastReview]="lastReview()"
        [daysWithoutReview]="daysWithoutReview()"
      />

      <mat-card-content>
        <app-index-article-move-to [articleId]="articleId()" />
      </mat-card-content>
    </mat-card>
  `,
})
export class ArticleDetailsComponent {
  readonly vaultIndexStore = inject(VaultIndexStore);
  readonly statisticsStore = inject(StatisticsStore);

  readonly articleId = input.required<ArticleId>();
  readonly tags = computed(() => {
    const article = this.vaultIndexStore.articles()[this.articleId()];
    return article?.tags ?? [];
  });
  readonly topics = computed(() => {
    const article = this.vaultIndexStore.articles()[this.articleId()];
    return article?.topics ?? [];
  });
  readonly statisitcs = computed(() => {
    const statistics = this.statisticsStore.articles()[this.articleId()];
    return statistics?.total ?? { positive: 0, incomplete: 0, negative: 0, unknown: 0 };
  });
  readonly created = computed(() => {
    const article = this.vaultIndexStore.articles()[this.articleId()];
    return formatDate(article?.created);
  });
  readonly indexed = computed(() => {
    const article = this.vaultIndexStore.articles()[this.articleId()];
    return formatDate(article?.indexed);
  });
  readonly lastReview = computed(() => {
    const article = this.statisticsStore.articles()[this.articleId()];
    return formatDate(article?.lastReview);
  });
  readonly score = computed(() => {
    const article = this.statisticsStore.articles()[this.articleId()];
    return article?.score ?? null;
  });
  readonly lastResult = computed(() => {
    const statistics = this.statisticsStore.articles()[this.articleId()];
    return statistics?.lastResult ?? null;
  });

  readonly daysWithoutReview = computed(() => {
    const statistics = this.statisticsStore.articles()[this.articleId()];
    const days = statistics?.lastReviewInterval_days;
    return days ? Math.ceil(days).toString() : '--';
  });
}
