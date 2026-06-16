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
import { getOverallScore } from './bl/get-overall-score';

type IndexRecord = {
  position: number;
  exists: boolean;
  articleId: ArticleId;
  indexed: string;
  totalReviewed: number;
  overallScore: string;
  overallScoreClass: string;
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
  ],
  templateUrl: 'index.html',
  styleUrl: 'index.scss',
})
export class AppIndexComponent implements OnInit {
  readonly vaultIndexStore = inject(VaultIndexStore);
  readonly statisticsStore = inject(StatisticsStore);

  readonly filter = signal<string | null>(null);

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
      const { overallScore, overallScoreClass } = getOverallScore(statistics);

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
        overallScore,
        // overallScore: ['priority_high', 'warning_amber', 'thumb_up'][Math.floor(Math.random() * 3)],
        overallScoreClass,
        tags: article?.tags ?? [],
        topics: article?.topics ?? [],
      };
    });
  });

  readonly displayedColumns = [
    'position',
    'exists',
    'articleId',
    'indexed',
    'totalReviewed',
    'overallScore',
  ];
  readonly columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];

  expandedArticle: ArticleId | null = null;
  isExpanded(articleId: ArticleId) {
    return this.expandedArticle === articleId;
  }

  toggle(articleId: ArticleId) {
    this.expandedArticle = this.isExpanded(articleId) ? null : articleId;
  }

  ngOnInit(): void {}

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
