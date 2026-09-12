import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { isValid } from '../../model/article-id';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { ParseArticleIdLogic, TryCreateArticleIdFromUrlLogic } from '../../process-bl';
import { GoToLastUrlProcess } from '../../processes/router';
import { AppTagComponent } from '../../components/tag/tag';
import { AppArticleScoreBlockComponent } from '../../components/article-score-block';
import { AppArticleLastResultBlockComponent } from '../../components/article-review-result-block';
import { VaultStore } from '../../store/vault/vault.store';
import { HintsState } from './hints-state';
import { AppHintsHeaderComponent } from './components/hints-header';
import { logAction } from '../../../services/debug-logger';

const place = 'AppHintsComponent';
@Component({
  selector: 'app-hints',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    AppTagComponent,
    AppArticleScoreBlockComponent,
    AppArticleLastResultBlockComponent,
    AppHintsHeaderComponent,
  ],
  templateUrl: './hints.html',
  styleUrl: './hints.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HintsState],
})
export class AppHintsComponent implements OnInit {
  readonly router = inject(Router);

  readonly hintsState = inject(HintsState);
  readonly vault = inject(VaultStore);
  readonly statisticsStore = inject(StatisticsStore);
  readonly tryCreateArticleIdFromUrl = inject(TryCreateArticleIdFromUrlLogic);
  readonly parseArticleId = inject(ParseArticleIdLogic);
  readonly gotoLastUrl = inject(GoToLastUrlProcess);

  public get articleUrl(): string {
    let url = decodeURI(this.router.parseUrl(this.router.url).toString());
    url = url.indexOf('/hints') === 0 ? url.slice(7) : url;
    return url;
  }

  /**
   * articleId
   */
  readonly articleId = signal(this.tryCreateArticleIdFromUrl(this.articleUrl));
  readonly article = computed(() => {
    const articleId = this.articleId();
    if (!isValid(articleId)) return null;

    try {
      this.parseArticleId(articleId);
      return this.vault.article(articleId)();
    } catch {
      return null;
    }
  });

  /**
   * title
   */
  readonly title = computed(() => {
    const articleId = this.articleId();
    if (!isValid(articleId)) return '';

    const article = this.article();
    if (!article) return '';

    return article.name.replace('.md', '');
  });

  /**
   * topics
   */
  readonly articleTopics = computed(() => {
    const articleId = this.articleId();
    if (!isValid(articleId)) return [];

    const articlesIndex = this.vault.articlesIndex();
    if (!articlesIndex[articleId]?.topics) return [];

    return articlesIndex[articleId].topics;
  });

  /**
   * score
   */
  readonly score = computed(() => {
    const statistics = this.articleStatistics();
    return statistics?.score ?? null;
  });

  /**
   * article statistics
   */
  readonly articleStatistics = computed(() => {
    const articleId = this.articleId();
    if (!isValid(articleId)) return null;

    const articlesIndex = this.statisticsStore.articles();
    return articlesIndex[articleId] ?? null;
  });

  /**
   * last review result
   */
  readonly lastReviewResult = computed(() => {
    const statistics = this.articleStatistics();
    return statistics?.lastResult ?? 'unknown';
  });

  takeNextHint() {
    this.hintsState.takeNext();
  }

  openArticle() {
    const article = this.article();
    if (article) {
      logAction(`open article`, place, { entity: article.articleId });
      this.router.navigate(article.articleId.split('/'));
    }
  }

  onClose() {
    this.gotoLastUrl();
  }

  ngOnInit() {
    const article = this.article();
    if (article) {
      this.hintsState.reset(article.hints ?? []);

      if (!this.hintsState.hasHints()) {
        this.router.navigate(this.articleId().split('/'));
      }
    }
  }
}
