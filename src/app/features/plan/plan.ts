import { Component, computed, inject, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ArticleId, parseArticleId } from '../../model/article-id';
import { Router } from '@angular/router';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { CreateTodaysPlanProcess } from '../../processes/create-todays-plan';
import { AppTagComponent } from '../../components/tag/tag';
import { isToday } from '../../helpers';
import { ReviewResult, ReviewResultUnknown } from '../../model/review-result';
import { StatisticsSlice } from '../../store/statistics/statistics.slice';
import { DefaultErrorsProcess } from '../../processes/default-errors.process';
import { NotificationService } from '../../services/notification.service';
import { logAction } from '../../../services/debug-logger';
import { AppArticleScoreComponent } from '../../components/article-score/article-score';
import { FeaturePlanStore } from './plan.store';
import { ViewportScroller } from '@angular/common';
import { VaultStore } from '../../store/vault/vault.store';
import { VaultSlice } from '../../store/vault/vault.slice';

const place = 'AppPlanComponent';
@Component({
  selector: 'app-plan',
  imports: [MatIconModule, MatListModule, AppTagComponent, AppArticleScoreComponent],
  templateUrl: './plan.html',
  styleUrl: './plan.scss',
})
export class AppPlanComponent implements OnInit {
  readonly router = inject(Router);
  readonly scroller = inject(ViewportScroller);

  readonly vault = inject(VaultStore);
  readonly exerciseStore = inject(ExerciseStore);
  readonly statisticsStore = inject(StatisticsStore);
  readonly store = inject(FeaturePlanStore);

  readonly createTodaysPlan = inject(CreateTodaysPlanProcess);
  readonly defaultErrorsProcess = inject(DefaultErrorsProcess);
  readonly notificationService = inject(NotificationService);

  readonly new = computed(() => {
    const articles = this.vault.articlesIndex();
    const plannedNew = this.exerciseStore.todayNew();
    const statistics = this.statisticsStore.articles();
    const excersises = Object.values(this.statisticsStore.exercises());

    const reviewedNew = excersises
      .filter((stat) => !!stat)
      .filter(({ started }) => isToday(started))
      .map(({ articleId }) => articleId);

    return this.getArticleView(plannedNew, reviewedNew, articles, statistics);
  });

  readonly repeat = computed(() => {
    const articles = this.vault.articlesIndex();
    const plannedRepeat = this.exerciseStore.todayRepeat();
    const statistics = this.statisticsStore.articles();
    const excersises = Object.values(this.statisticsStore.exercises());

    const reviewedRepeat = excersises
      .filter((stat) => !!stat)
      .filter(({ repeates }) => repeates.find((date) => isToday(date)))
      .map(({ articleId }) => articleId);

    return this.getArticleView(plannedRepeat, reviewedRepeat, articles, statistics);
  });

  readonly consolidate = computed(() => {
    const articles = this.vault.articlesIndex();
    const plannedConsolidate = this.exerciseStore.todayConsolidate();
    const statistics = this.statisticsStore.articles();
    const excersises = Object.values(this.statisticsStore.exercises());

    const reviewedConsolidate = excersises
      .filter((stat) => !!stat)
      .filter(({ consolidations }) => consolidations.find(({ date }) => isToday(date)))
      .map(({ articleId }) => articleId);

    return this.getArticleView(plannedConsolidate, reviewedConsolidate, articles, statistics);
  });

  open(articleId: ArticleId) {
    logAction(`open article`, place, { entity: articleId });
    const { path, name } = parseArticleId(articleId);
    this.store.patchScroll(this.scroller.getScrollPosition());
    this.router.navigate([...path, name]);
  }

  async ngOnInit() {
    try {
      this.createTodaysPlan();
    } catch (error) {
      if (await this.defaultErrorsProcess(error)) return;

      // TODO: handle errors and return

      // default error behavior
      this.notificationService.showError(error);
    }

    setTimeout(() => {
      this.scroller.scrollToPosition(this.store.scroll());
    }, 100);
  }

  getArticleView(
    planned: ArticleId[],
    reviewed: ArticleId[],
    articles: VaultSlice['articlesIndex'],
    statistics: StatisticsSlice['articles'],
  ): Array<{
    articleId: ArticleId;
    tags: string[];
    reviewed: boolean;
    result: ReviewResult;
    score: number | null;
  }> {
    return Array.from(new Set([...planned, ...reviewed]).values())
      .sort((a, b) => (a < b ? -1 : 1))
      .map((articleId) => ({
        articleId,
        tags: articles[articleId]?.tags ?? [],
        reviewed: isToday(statistics[articleId]?.lastReview),
        result: isToday(statistics[articleId]?.lastReview)
          ? (statistics[articleId]?.lastResult ?? ReviewResultUnknown)
          : ReviewResultUnknown,
        score: statistics[articleId]?.score ?? null,
      }));
  }
}
