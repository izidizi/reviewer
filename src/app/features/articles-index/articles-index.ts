import { Component, computed, inject } from '@angular/core';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { VaultIndexStore } from '../../store/vault-index/vault-index.store';
import { VaultArticle } from '../../model/vault-article';
import { VaultArticleStatistics } from '../../model/vault-article-statistics';
import { ArticleId } from '../../model/article-id';

@Component({
  selector: 'app-articles-index',
  imports: [],
  templateUrl: './articles-index.html',
  styleUrl: './articles-index.scss',
})
export class AppArticlesIndexComponent {
  readonly indexStore = inject(VaultIndexStore);
  readonly statisticsStore = inject(StatisticsStore);

  readonly articles = computed(() => {
    const articlesSet = new Set<ArticleId>();

    Object.values(this.indexStore.articles())
      .filter((article): article is VaultArticle => !!article)
      .forEach(({ articleId }) => articlesSet.add(articleId));

    Object.values(this.statisticsStore.articles())
      .filter((article): article is VaultArticleStatistics => !!article)
      .forEach(({ articleId }) => articlesSet.add(articleId));

    // ;

    return Array.from(articlesSet.values())
      .sort((a, b) => (a < b ? -1 : 1))
      .map((articleId) => {
        const indexedArticle = this.indexStore.articles()[articleId];

        return { articleId, exists: !!indexedArticle };
      });
  });
}
