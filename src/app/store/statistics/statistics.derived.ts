import { computed } from '@angular/core';
import { StateSignals } from '@ngrx/signals';
import { StatisticsSlice } from './statistics.slice';
import { isToday } from '../../helpers';
import { VaultArticleExerciseStat } from '../../model/vault-article-exercise-stat';

export function statisticsDerived(store: StateSignals<StatisticsSlice>) {
  const todayNewCompleted = computed(() =>
    Object.values(store.exercises())
      .filter((exerciseStatistics): exerciseStatistics is VaultArticleExerciseStat => {
        if (!exerciseStatistics) return false;

        return isToday(exerciseStatistics.started);
      })
      .map(({ articleId }) => articleId),
  );

  const todayRepeatCompleted = computed(() =>
    Object.values(store.exercises())
      .filter((exerciseStatistics): exerciseStatistics is VaultArticleExerciseStat => {
        if (!exerciseStatistics) return false;

        for (const repeatDate of exerciseStatistics.repeates) {
          if (isToday(repeatDate)) return true;
        }

        return false;
      })
      .map(({ articleId }) => articleId),
  );

  const todayConsolidateCompleted = computed(() =>
    Object.values(store.exercises())
      .filter((exerciseStatistics): exerciseStatistics is VaultArticleExerciseStat => {
        if (!exerciseStatistics) return false;

        for (const consolidation of exerciseStatistics.consolidations) {
          if (isToday(consolidation.date)) return true;
        }

        return false;
      })
      .map(({ articleId }) => articleId),
  );

  return {
    todayNewCompleted,
    todayRepeatCompleted,
    todayConsolidateCompleted,
  };
}
