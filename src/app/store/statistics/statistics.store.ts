import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
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
  withMethods((store) => {
    return {
      setReviews: (reviews: ReviewStorage[]) => patchState(store, updaters.setReviews(reviews)),
      addReview: (review: ReviewStorage) => patchState(store, updaters.addReview(review)),
      setArticleStatistics: (statistics: StatisticsSlice['articles']) =>
        patchState(store, updaters.setArticleStatistics(statistics)),
      addStatistics: (articleStatisics: VaultArticleStatistics) =>
        patchState(store, updaters.patchArticleStatistics(articleStatisics)),
      setExerciseStatistics: (statistics: StatisticsSlice['exercises']) =>
        patchState(store, updaters.setExerciseStatistics(statistics)),
      setDayStatistics: (dayStatistics: StatisticsSlice['days']) =>
        patchState(store, updaters.setDayStatistics(dayStatistics)),
    };
  }),
);
