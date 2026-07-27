import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import * as updatersObsolete from './statistics-obsolete.updaters';
import * as updaters from './statistics.updaters';
import { initialStatisticsSlice, StatisticsSlice } from './statistics.slice';
import { VaultArticleStatistics } from '../../model/vault-article-statistics';

export type StatisticsStore = InstanceType<typeof StatisticsStore>;

export const StatisticsStore = signalStore(
  { providedIn: 'root' },
  withState(initialStatisticsSlice),

  withMethods((store) => ({
    setArticle: (data: updaters.SetArticleData) => patchState(store, updaters.setArticle(data)),
    removeArticle: (data: updaters.RemoveArticleData) =>
      patchState(store, updaters.removeArticle(data)),
    setExercise: (data: updaters.SetExerciseData) => patchState(store, updaters.setExercise(data)),
    setDay: (data: updaters.SetDayData) => patchState(store, updaters.setDay(data)),
  })),

  /* obsolete */
  withMethods((store) => {
    return {
      /**
       * @deprecated
       */
      setArticleStatistics: (statistics: StatisticsSlice['articles']) =>
        patchState(store, updatersObsolete.setArticleStatistics(statistics)),
      /**
       * @deprecated
       */
      addStatistics: (articleStatisics: VaultArticleStatistics) =>
        patchState(store, updatersObsolete.patchArticleStatistics(articleStatisics)),
      /**
       * @deprecated
       */
      setExerciseStatistics: (statistics: StatisticsSlice['exercises']) =>
        patchState(store, updatersObsolete.setExerciseStatistics(statistics)),
      /**
       * @deprecated
       */
      setDayStatistics: (dayStatistics: StatisticsSlice['days']) =>
        patchState(store, updatersObsolete.setDayStatistics(dayStatistics)),
    };
  }),
);
