import { Component, computed, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Selectors } from '../../store/selectors';
import { SaveConfigufationProcess } from '../../processes/save-configuration.process';
import { logAction, logError } from '../../../services/debug-logger';
import { DefaultErrorsProcess } from '../../processes/default-errors.process';
import { NotificationService } from '../../services/notification.service';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { VaultStore } from '../../store/vault/vault.store';
import { VaultStateStore } from '../../store/vault-state/vault-state.store';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { isToday } from '../../helpers';
import { ArticleId } from '../../model/article-id';
import { VaultSlice } from '../../store/vault/vault.slice';
import { StatisticsSlice } from '../../store/statistics/statistics.slice';
import { ReviewResult, ReviewResultUnknown } from '../../model/review-result';
import { MatListModule } from '@angular/material/list';
import { FeatureConsolidateStore } from './consolidate.store';
import { Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { AppTagComponent } from '../../components/tag/tag';
import { AppArticleScoreComponent } from '../../components/article-score/article-score';
import { CreateConsolidationPlanProcess } from '../../processes/create-plan';
import { PlanStore } from '../../store/plan/plan.store';

const place = 'AppConsolidatePage';
@Component({
  selector: 'app-consolidate-page',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatListModule,
    AppTagComponent,
    AppArticleScoreComponent,
  ],
  templateUrl: './consolidate.page.html',
  styleUrl: './consolidate.page.scss',
})
export class ConsolidatePage implements OnInit {
  readonly router = inject(Router);
  readonly scroller = inject(ViewportScroller);

  readonly selectors = inject(Selectors);

  readonly store = inject(FeatureConsolidateStore);
  readonly vault = inject(VaultStore);
  readonly vaultState = inject(VaultStateStore);
  readonly exerciseStore = inject(ExerciseStore);
  readonly statisticsStore = inject(StatisticsStore);
  readonly planStore = inject(PlanStore);

  readonly createConsolidationPlanProcess = inject(CreateConsolidationPlanProcess);
  readonly defaultErrorsProcess = inject(DefaultErrorsProcess);
  readonly notificationService = inject(NotificationService);

  readonly consolidate = computed(() => {
    const newList = this.planStore.consolidateListArticles();

    return newList.sort((a, b) => (a.name < b.name ? -1 : 1));
  });

  async ngOnInit() {
    try {
      this.createConsolidationPlanProcess();
    } catch (error) {
      if (await this.defaultErrorsProcess(error)) return;

      // default error behavior
      this.notificationService.showError(error);
    }

    setTimeout(() => {
      this.scroller.scrollToPosition(this.store.scroll());
    }, 100);
  }

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
