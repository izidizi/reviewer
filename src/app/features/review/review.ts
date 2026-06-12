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
import { VaultIndexStore } from '../../store/vault-index/vault-index.store';
import { Router } from '@angular/router';
import { parserArticleIdFromURL } from '../../model/article-id';
import { MarkdownComponent } from 'ngx-markdown';
import { AppReviewButtonsComponent } from './components/review-buttons';
import { ReviewResult, ReviewResultUnknown } from '../../model/review-result';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { isToday } from '../../helpers';
import { ReviewProcess } from '../../processes/review';
import { ParseArticleIdBL } from '../../process-bl';
import { NotificationService } from '../../services/notification.service';
import { LoadArticleContentLogic } from './logics/get-article-content';
import { ThemeService } from '../../../services/theme/theme.service';

@Component({
  selector: 'app-review',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MarkdownComponent,
    AppReviewButtonsComponent,
  ],
  templateUrl: './review.html',
  styleUrl: './review.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppReviewComponent implements OnInit {
  readonly router = inject(Router);

  readonly themeService = inject(ThemeService);
  readonly vaultIndexStore = inject(VaultIndexStore);
  readonly statisticsStore = inject(StatisticsStore);
  readonly notificationService = inject(NotificationService);
  readonly parseArticleId = inject(ParseArticleIdBL);
  readonly reviewProcess = inject(ReviewProcess);
  readonly loadArticleContentLogic = inject(LoadArticleContentLogic);

  readonly urlTree = this.router.parseUrl(this.router.url);

  readonly themeClass = computed(() => {
    const colorScheme = this.themeService.colorScheme();
    return colorScheme === 'dark' ? 'dark' : '';
  });

  /**
   * articleId
   */
  readonly articleId = signal(parserArticleIdFromURL(this.urlTree.toString()));
  readonly isValidArticleId = computed(() => {
    const articleId = this.articleId();
    if (!articleId) return false;
    try {
      this.parseArticleId(articleId);
      return true;
    } catch {
      return false;
    }
  });

  /**
   * title
   */
  readonly title = computed(() => {
    const isValidArticleId = this.isValidArticleId();
    if (!isValidArticleId) return '';

    const articleId = this.articleId();
    if (!articleId) return '';

    const { name } = this.parseArticleId(articleId);
    return name.replace('.md', '');
  });

  readonly articleContent = computed(() => {
    const articleId = this.articleId();
    if (articleId === null) return '### failed to load article content, unknown article';

    const isLoading = this.isLoading();
    if (isLoading) return '### loading...';

    const articlesIndex = this.vaultIndexStore.articles();
    return articlesIndex[articleId]?.content ?? '### article not longer available';
  });

  readonly articleTopics = computed(() => {
    const articleId = this.articleId();
    if (articleId === null) return [];

    const articlesIndex = this.vaultIndexStore.articles();
    if (!articlesIndex[articleId]?.content) return [];

    return articlesIndex[articleId].topics;
  });

  readonly reviewResult = computed<ReviewResult | null>(() => {
    const articleId = this.articleId();
    if (articleId === null) return null;

    const articlesIndex = this.statisticsStore.articles();
    const statistics = articlesIndex[articleId];
    if (!statistics) return null;

    return isToday(statistics.lastReview) ? statistics.lastResult : null;
  });

  readonly isReviewed = computed(() => {
    const reviewResult = this.reviewResult();
    return reviewResult !== null && reviewResult !== ReviewResultUnknown;
  });

  onClose() {
    this.router.navigate(['plan']);
  }

  selectResult(result: ReviewResult) {
    const articleId = this.articleId();
    if (articleId) {
      this.reviewProcess(articleId, result);
    }

    this.router.navigate(['plan']);
  }

  readonly isLoading = signal<boolean>(false);

  async ngOnInit() {
    const articleId = this.articleId();
    if (articleId) {
      this.isLoading.set(true);
      await this.loadArticleContentLogic(articleId);
      this.isLoading.set(false);
    }
  }
}
