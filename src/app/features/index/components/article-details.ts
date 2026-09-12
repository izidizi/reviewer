import { Component, computed, inject, input } from '@angular/core';
import { ArticleId } from '../../../model/article-id';
import { ArticleMoveToComponent } from './move-to';
import { StatisticsStore } from '../../../store/statistics/statistics.store';
import { MatCardModule } from '@angular/material/card';
import { ArticleView } from './article-view';
import { formatDate } from '../../../helpers';
import { VaultStore } from '../../../store/vault/vault.store';
import { ArticleDeleteComponent } from './delete';

@Component({
  selector: 'app-index-article-details',
  imports: [ArticleMoveToComponent, ArticleDeleteComponent, MatCardModule, ArticleView],
  styles: `
    :host {
      min-height: 0;
    }

    mat-card-content {
      display: flex;
      align-items: baseline;
      app-index-article-move-to {
        flex-grow: 1;
      }
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
        <app-index-article-delete [articleId]="articleId()" />
      </mat-card-content>
    </mat-card>
  `,
})
export class ArticleDetailsComponent {
  readonly vault = inject(VaultStore);
  readonly statisticsStore = inject(StatisticsStore);

  readonly articleId = input.required<ArticleId>();
  readonly article = computed(() => {
    return this.vault.article(this.articleId())();
  });
  readonly tags = computed(() => this.article()?.tags ?? []);
  readonly topics = computed(() => this.article()?.topics ?? []);
  readonly created = computed(() => formatDate(this.article()?.created));
  readonly indexed = computed(() => formatDate(this.article()?.indexed));

  readonly statisitcs = computed(() => {
    const statistics = this.statisticsStore.articles()[this.articleId()];
    return statistics?.total ?? { positive: 0, incomplete: 0, negative: 0, unknown: 0 };
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
