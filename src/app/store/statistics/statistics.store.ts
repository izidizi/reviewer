import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import * as updatersObsolete from './statistics-obsolete.updaters';
import * as updaters from './statistics.updaters';
import { initialStatisticsSlice, StatisticsSlice } from './statistics.slice';
import { ReviewStorage } from '../../../model/storage/review';
import { VaultArticleStatistics } from '../../model/vault-article-statistics';
import { statisticsDerived } from './statistics.derived';

export type StatisticsStore = InstanceType<typeof StatisticsStore>;

export const StatisticsStore = signalStore(
  { providedIn: 'root' },
  withState(initialStatisticsSlice),
  withComputed((store) => statisticsDerived(store)),

  withMethods((store) => ({
    setArticle: (data: updaters.SetArticleData) => patchState(store, updaters.setArticle(data)),
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
