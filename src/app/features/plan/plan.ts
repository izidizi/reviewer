import { Component, computed, inject, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ArticleId } from '../../model/article-id';
import { Router } from '@angular/router';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { AppTagComponent } from '../../components/tag/tag';
import { isToday } from '../../helpers';
import { ReviewResult, ReviewResultUnknown } from '../../model/review-result';
import { StatisticsSlice } from '../../store/statistics/statistics.slice';
import { DefaultErrorsProcess } from '../../processes/default-errors.process';
import { NotificationService } from '../../services/notification.service';
import { logAction, logError } from '../../../services/debug-logger';
import { AppArticleScoreComponent } from '../../components/article-score/article-score';
import { FeaturePlanStore } from './plan.store';
import { ViewportScroller } from '@angular/common';
import { VaultStore } from '../../store/vault/vault.store';
import { VaultSlice } from '../../store/vault/vault.slice';
import { MatButtonModule } from '@angular/material/button';
import { VaultStateStore } from '../../store/vault-state/vault-state.store';
import { MatBadgeModule } from '@angular/material/badge';
import { Selectors } from '../../store/selectors';
import { SaveConfigufationProcess } from '../../processes/save-configuration.process';
import { CreatePlanProcess } from '../../processes/create-plan';
import { PlanStore } from '../../store/plan/plan.store';

const place = 'AppPlanComponent';
@Component({
  selector: 'app-plan',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatListModule,
    AppTagComponent,
    AppArticleScoreComponent,
  ],
  templateUrl: './plan.html',
  styleUrl: './plan.scss',
})
export class AppPlanComponent implements OnInit {
  readonly router = inject(Router);
  readonly scroller = inject(ViewportScroller);

  readonly selectors = inject(Selectors);
  readonly planStore = inject(PlanStore);

  readonly vault = inject(VaultStore);
  readonly vaultState = inject(VaultStateStore);
  readonly exerciseStore = inject(ExerciseStore);
  readonly statisticsStore = inject(StatisticsStore);
  readonly store = inject(FeaturePlanStore);

  readonly createPlanProcess = inject(CreatePlanProcess);
  readonly defaultErrorsProcess = inject(DefaultErrorsProcess);
  readonly notificationService = inject(NotificationService);

  readonly new = computed(() => {
    const newList = this.planStore.newListArticles();

    return newList.sort((a, b) => (a.name < b.name ? -1 : 1));
  });

  readonly repeat = computed(() => {
    const newList = this.planStore.repeatListArticles();

    return newList.sort((a, b) => (a.name < b.name ? -1 : 1));
  });

  open(articleId: ArticleId) {
    this.store.patchScroll(this.scroller.getScrollPosition());

    const article = this.vault.article(articleId)();
    if (article) {
      logAction(`open article`, place, { entity: articleId });
      if (article.hints.length > 0) {
        this.router.navigate(['hints', ...articleId.split('/')]);
      } else {
        this.router.navigate(articleId.split('/'));
      }
    }
  }

  async ngOnInit() {
    try {
      this.createPlanProcess();
    } catch (error) {
      if (await this.defaultErrorsProcess(error)) return;

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
    lastScore: number | null;
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
        lastScore: 1,
      }));
  }

  readonly hasChanges = this.selectors.hasChanges;

  readonly saveConfigurationProcess = inject(SaveConfigufationProcess);
  save() {
    logAction('save vault configuration form', place);

    this.saveConfigurationProcess().catch(async (error) => {
      logError(error, place);

      if (await this.defaultErrorsProcess(error)) return;

      this.notificationService.showError(error);
    });
  }
}
