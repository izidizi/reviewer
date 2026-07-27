import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AppIndexToolbar } from './components/index-toolbar';
import { ArticleId } from '../../model/article-id';
import { isValidDate } from '../../../model/utils/invalid-date';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { VaultArticleStatistics } from '../../model/vault-article-statistics';
import { ArticleDetailsComponent } from './components/article-details';
import { AppArticleScoreComponent } from '../../components/article-score/article-score';
import { FeatureIndexStore } from './index.store';
import { ViewportScroller } from '@angular/common';
import { IndexVaultStore } from '../../scenarios/index-vault/index-vault.store';
import { VaultStore } from '../../store/vault/vault.store';
import { IndexStatistics } from './components/index-statistics';
import { IndexOverflow } from './components/index-overflow';
import { IndexFilterLogic } from './filter.logic';
import { RenderRecordsLogic } from './render-records.logic';

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
    MatButtonToggleModule,
    AppIndexToolbar,
    MatProgressBarModule,
    MatButtonModule,
    ArticleDetailsComponent,
    AppArticleScoreComponent,
    IndexStatistics,
    IndexOverflow,
  ],
  templateUrl: 'index.html',
  styleUrl: 'index.scss',
})
export class AppIndexComponent implements OnInit {
  readonly scroller = inject(ViewportScroller);

  readonly vault = inject(VaultStore);
  readonly indexVaultStore = inject(IndexVaultStore);
  readonly statisticsStore = inject(StatisticsStore);
  readonly featureIndexStore = inject(FeatureIndexStore);

  readonly filterLogic = inject(IndexFilterLogic);
  readonly renderRecordsLogic = inject(RenderRecordsLogic);

  readonly maxIndexRecords: number = 10;

  readonly isRenderModeStatistics = computed(() => {
    return this.featureIndexStore.renderMode() === 'stat';
  });
  readonly renderFilter = computed(() => {
    return (
      this.featureIndexStore.renderMode() === 'filter' &&
      (this.articleIndexRecords().length <= this.maxIndexRecords ||
        this.featureIndexStore.renderRecordsAnyway())
    );
  });
  readonly renderFilterOverflow = computed(() => {
    return (
      this.featureIndexStore.renderMode() === 'filter' &&
      this.articleIndexRecords().length > this.maxIndexRecords &&
      this.featureIndexStore.renderRecordsAnyway() === false
    );
  });
  readonly filter = signal<string | null>(this.featureIndexStore.filter());
  readonly articleIndexRecords = computed(() => {
    const renderMode = this.featureIndexStore.renderMode();

    if (renderMode !== 'filter') return [];

    const filter = this.featureIndexStore.filter();
    const filterNoScore = this.featureIndexStore.filterNoScore();

    console.log('perform heavy computations');
    const articlesSet = new Set<ArticleId>();

    Object.entries(this.vault.articlesIndex())
      .filter(([x, article]) => !!article)
      .forEach(([articleId]) => articlesSet.add(articleId as ArticleId));

    Object.values(this.statisticsStore.articles())
      .filter((article): article is VaultArticleStatistics => !!article)
      .forEach(({ articleId }) => articlesSet.add(articleId));

    return Array.from(articlesSet.values())
      .filter((articleId) => articleId.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
      .map((articleId, index) => {
        const article = this.vault.article(articleId)();
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
      })
      .filter((record) => (filterNoScore ? record.score === null : true));
  });

  readonly isIndexProcessActive = this.indexVaultStore.isIndexProcessActive;
  readonly dataSource = new MatTableDataSource<IndexRecord>();

  readonly dataSourceEffect = effect(() => {
    const records = this.articleIndexRecords();

    this.dataSource.data = records;
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
    this.filterLogic((event.target as HTMLInputElement).value);
  }

  renderRecords() {
    this.renderRecordsLogic();
  }

  filterNoScore(val: boolean) {
    this.featureIndexStore.setFilterNoScore(val);
  }

  clear() {
    if (this.featureIndexStore.renderMode() === 'filter') {
      this.featureIndexStore.setRenderMode('stat');
    }
    this.featureIndexStore.setFilter('');
    this.featureIndexStore.setFilterNoScore(false);
  }
}
