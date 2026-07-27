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
import { MarkdownComponent } from 'ngx-markdown';
import { AppReviewButtonsComponent } from './components/review-buttons';
import { ReviewResult, ReviewResultUnknown } from '../../model/review-result';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { isToday } from '../../helpers';
import { ReviewProcess } from '../../processes/review';
import { ParseArticleIdLogic, TryCreateArticleIdFromStringLogic } from '../../process-bl';
import { NotificationService } from '../../services/notification.service';
import { LoadArticleContentScenario } from './scenarios/get-article-content';
import { ThemeService } from '../../../services/theme/theme.service';
import { GoToLastUrlProcess } from '../../processes/router';
import { AppTagComponent } from '../../components/tag/tag';
import { AppArticleScoreBlockComponent } from '../../components/article-score-block';
import { AppArticleLastResultBlockComponent } from '../../components/article-review-result-block';
import { AppReviewHeaderComponent } from './components/review-header';
import { CacheStore } from '../../store/cache/cache.store';
import { VaultStore } from '../../store/vault/vault.store';

@Component({
  selector: 'app-review',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MarkdownComponent,
    AppReviewButtonsComponent,
    AppTagComponent,
    AppReviewHeaderComponent,
    AppArticleScoreBlockComponent,
    AppArticleLastResultBlockComponent,
  ],
  templateUrl: './review.html',
  styleUrl: './review.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppReviewComponent implements OnInit {
  readonly router = inject(Router);

  readonly themeService = inject(ThemeService);
  readonly vault = inject(VaultStore);
  readonly cache = inject(CacheStore);
  readonly statisticsStore = inject(StatisticsStore);
  readonly notificationService = inject(NotificationService);
  readonly tryCreateArticleIdFromString = inject(TryCreateArticleIdFromStringLogic);
  readonly parseArticleId = inject(ParseArticleIdLogic);
  readonly reviewProcess = inject(ReviewProcess);
  readonly loadArticleContentLogic = inject(LoadArticleContentScenario);
  readonly gotoLastUrl = inject(GoToLastUrlProcess);

  readonly themeClass = computed(() => {
    const colorScheme = this.themeService.colorScheme();
    return colorScheme === 'dark' ? 'dark' : '';
  });

  public get articleUrl(): string {
    let url = decodeURI(this.router.parseUrl(this.router.url).toString());
    url = url.indexOf('/') === 0 ? url.slice(1) : url;
    return url;
  }

  /**
   * articleId
   */
  readonly articleId = signal(this.tryCreateArticleIdFromString(this.articleUrl));
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

  readonly articleContent = computed(() => {
    const articleId = this.articleId();
    if (!isValid(articleId)) return '### failed to load article content, unknown article';

    const isLoading = this.isLoading();
    if (isLoading) return '### loading...';

    const articlesIndex = this.cache.articlesContent();
    return articlesIndex[articleId]?.content ?? '### article no longer available';
  });

  readonly articleTopics = computed(() => {
    const articleId = this.articleId();
    if (!isValid(articleId)) return [];

    const articlesIndex = this.vault.articlesIndex();
    if (!articlesIndex[articleId]?.topics) return [];

    return articlesIndex[articleId].topics;
  });

  readonly reviewResult = computed<ReviewResult | null>(() => {
    const articleId = this.articleId();
    if (!isValid(articleId)) return null;

    const articlesIndex = this.statisticsStore.articles();
    const statistics = articlesIndex[articleId];
    if (!statistics) return null;

    return isToday(statistics.lastReview) ? statistics.lastResult : null;
  });

  readonly isReviewed = computed(() => {
    const reviewResult = this.reviewResult();
    return reviewResult !== null && reviewResult !== ReviewResultUnknown;
  });

  readonly score = computed(() => {
    const statistics = this.articleStatists();
    return statistics?.score ?? null;
  });

  readonly articleStatists = computed(() => {
    const articleId = this.articleId();
    if (!isValid(articleId)) return null;

    const articlesIndex = this.statisticsStore.articles();
    return articlesIndex[articleId] ?? null;
  });

  readonly lastReviewResult = computed(() => {
    const statistics = this.articleStatists();
    return statistics?.lastResult ?? 'unknown';
  });

  onClose() {
    this.gotoLastUrl();
  }

  selectResult(result: ReviewResult) {
    const articleId = this.articleId();
    if (isValid(articleId)) {
      this.reviewProcess(articleId, result);
    }

    this.gotoLastUrl();
  }

  readonly isLoading = signal<boolean>(false);

  async ngOnInit() {
    const articleId = this.articleId();
    if (isValid(articleId)) {
      this.isLoading.set(true);
      await this.loadArticleContentLogic(articleId);
      this.isLoading.set(false);
    }
  }
}
