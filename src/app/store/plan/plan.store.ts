import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { initialPlanSlice } from './plan.slice';
import * as updaters from './plan.updaters';
import { StatisticsStore } from '../statistics/statistics.store';
import { computed, inject } from '@angular/core';
import { VaultStore } from '../vault/vault.store';
import { isToday } from '../../helpers';
import { reviewResultScore } from '../../model/review-result';

export type PlanStore = InstanceType<typeof PlanStore>;

export const PlanStore = signalStore(
  { providedIn: 'root' },
  withState(initialPlanSlice),
  withComputed((store) => {
    const vaultStore = inject(VaultStore);
    const statisticsStore = inject(StatisticsStore);
    return {
      newListArticles: computed(() => {
        const newList = store.newList();
        const articlesStatistics = statisticsStore.articles();

        return newList
          .map((articleId) => vaultStore.article(articleId)())
          .filter((article) => !!article)
          .map(({ articleId, name, tags }) => ({
            articleId,
            reviewed: isToday(articlesStatistics[articleId]?.lastReview),
            name,
            tags,
            result: articlesStatistics[articleId]?.lastResult,
            score: articlesStatistics[articleId]?.score,
          }));
      }),

      repeatListArticles: computed(() => {
        const repeatList = store.repeatList();
        const articlesStatistics = statisticsStore.articles();
        const articlesExercises = statisticsStore.exercises();

        return repeatList
          .map((articleId) => vaultStore.article(articleId)())
          .filter((article) => !!article)

          .map(({ articleId, name, tags }) => {
            const reviewed =
              (articlesExercises[articleId]?.repeates ?? []).findIndex((reviewDate) =>
                isToday(reviewDate),
              ) >= 0 ||
              (articlesExercises[articleId]?.consolidations ?? []).findIndex(({ date }) =>
                isToday(date),
              ) >= 0;
            return {
              articleId,
              reviewed,
              name,
              tags,
              result: articlesStatistics[articleId]?.lastResult,
              score: articlesStatistics[articleId]?.score,
              lastScore: reviewResultScore(articlesStatistics[articleId]?.lastResult ?? 'unknown'),
            };
          });
      }),

      consolidateListArticles: computed(() => {
        const consolidateList = store.consolidateList();
        const articlesStatistics = statisticsStore.articles();
        const articlesExercises = statisticsStore.exercises();

        return consolidateList
          .map((articleId) => vaultStore.article(articleId)())
          .filter((article) => !!article)

          .map(({ articleId, name, tags }) => {
            const reviewed =
              (articlesExercises[articleId]?.repeates ?? []).findIndex((reviewDate) =>
                isToday(reviewDate),
              ) >= 0 ||
              (articlesExercises[articleId]?.consolidations ?? []).findIndex(({ date }) =>
                isToday(date),
              ) >= 0;
            const daysWithoutReview = articlesStatistics[articleId]
              ? articlesStatistics[articleId].lastReviewInterval_days.toFixed(0)
              : '--';
            return {
              articleId,
              reviewed,
              name,
              tags,
              result: reviewed ? articlesStatistics[articleId]?.lastResult : null,
              score: articlesStatistics[articleId]?.score,
              lastScore: reviewResultScore(articlesStatistics[articleId]?.lastResult ?? 'unknown'),
              daysWithoutReview,
            };
          });
      }),
    };
  }),
  withMethods((store) => {
    return {
      patchPlan: (data: updaters.PatchPlanData) => patchState(store, updaters.patchPlan(data)),
      patchConsolidatePlan: (data: updaters.PatchConsolidatePlanData) =>
        patchState(store, updaters.patchConsolidatePlan(data)),
    };
  }),
);
