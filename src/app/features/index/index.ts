import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { VaultArticle } from '../../model/vault-article';
import { VaultIndexStore } from '../../store/vault-index/vault-index.store';
import { AppIndexToolbar } from './components/index-toolbar';
import { ArticleId } from '../../model/article-id';
import { isValidDate } from '../../../model/utils/invalid-date';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { VaultArticleStatistics } from '../../model/vault-article-statistics';
import { ArticleDetailsComponent } from './components/article-details';
import { AppArticleScoreComponent } from '../../components/article-score/article-score';
import { FeatureIndexStore } from './index.store';
import { ViewportScroller } from '@angular/common';

type IndexRecord = {
  position: number;
  exists: boolean;
  articleId: ArticleId;
  indexed: string;
  totalReviewed: number;
  score: number | null;
  scoreClass: string;
  daysWithoutReview: string;
};

@Component({
  selector: 'app-index',
  imports: [
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    AppIndexToolbar,
    MatProgressBarModule,
    MatButtonModule,
    ArticleDetailsComponent,
    AppArticleScoreComponent,
  ],
  templateUrl: 'index.html',
  styleUrl: 'index.scss',
})
export class AppIndexComponent implements OnInit {
  readonly scroller = inject(ViewportScroller);

  readonly vaultIndexStore = inject(VaultIndexStore);
  readonly statisticsStore = inject(StatisticsStore);
  readonly featureIndexStore = inject(FeatureIndexStore);

  readonly filter = signal<string | null>(this.featureIndexStore.filter());

  readonly isIndexProcessActive = this.vaultIndexStore.isIndexProcessActive;
  readonly dataSource = new MatTableDataSource<IndexRecord>();

  readonly dataSourceEffect = effect(() => {
    const articlesSet = new Set<ArticleId>();

    Object.values(this.vaultIndexStore.articles())
      .filter((article): article is VaultArticle => !!article)
      .forEach(({ articleId }) => articlesSet.add(articleId));

    Object.values(this.statisticsStore.articles())
      .filter((article): article is VaultArticleStatistics => !!article)
      .forEach(({ articleId }) => articlesSet.add(articleId));

    this.dataSource.data = Array.from(articlesSet.values()).map((articleId, index) => {
      const article = this.vaultIndexStore.articles()[articleId];
      const statistics = this.statisticsStore.articles()[articleId];
      const score = statistics?.score ?? null;
      const daysWithoutReview = statistics?.lastReviewInterval_days;
      const lastReviewResult = statistics?.lastResult;
      const scoreClass =
        lastReviewResult === 'negative'
          ? 'bad'
          : lastReviewResult === 'positive'
            ? 'good'
            : 'normal';

      return {
        position: index + 1,
        exists: !!article,
        articleId,
        indexed:
          !!article && isValidDate(article.indexed) ? article.indexed.toLocaleDateString() : '--',
        totalReviewed: statistics
          ? statistics.total.positive +
            statistics.total.incomplete +
            statistics.total.negative +
            statistics.total.unknown
          : 0,
        score,
        scoreClass,
        tags: article?.tags ?? [],
        topics: article?.topics ?? [],
        daysWithoutReview:
          daysWithoutReview != null ? Math.ceil(daysWithoutReview).toString() : '--',
      };
    });
  });

  readonly displayedColumns = ['position', 'exists', 'articleId', 'score', 'daysWithoutReview'];
  readonly columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];

  expandedArticle: ArticleId | null = null;
  isExpanded(articleId: ArticleId) {
    return this.expandedArticle === articleId;
  }

  toggle(articleId: ArticleId) {
    this.expandedArticle = this.isExpanded(articleId) ? null : articleId;
    this.featureIndexStore.setExpanded(this.expandedArticle);
  }

  ngOnInit(): void {
    this.dataSource.filter = this.featureIndexStore.filter();
    setTimeout(() => {
      this.scroller.scrollToPosition(this.featureIndexStore.scroll());
    }, 100);

    const expandedArticleId = this.featureIndexStore.expandedArticleId();
    if (expandedArticleId) this.toggle(expandedArticleId);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.featureIndexStore.setFilter(filterValue);
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
