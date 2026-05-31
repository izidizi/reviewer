import { PartialStateUpdater } from '@ngrx/signals';
import { StatisticsSlice } from './statistics.slice';
import { ReviewStorage } from '../../../model/storage/review';
import { VaultArticleStatistics } from '../../model/vault-article-statistics';

export const setReviews: (reviews: ReviewStorage[]) => PartialStateUpdater<StatisticsSlice> = (
  reviews,
) => {
  return () => ({
    reviews,
  });
};

export const addReview: (review: ReviewStorage) => PartialStateUpdater<StatisticsSlice> = (
  review,
) => {
  return (state) => ({
    reviews: [...state.reviews, review],
  });
};

export const setArticleStatistics: (
  articles: StatisticsSlice['articles'],
) => PartialStateUpdater<StatisticsSlice> = (articles) => {
  return () => ({
    articles,
  });
};

export const patchArticleStatistics: (
  articleStatistics: VaultArticleStatistics,
) => PartialStateUpdater<StatisticsSlice> = (articleStatistics) => {
  return (state) => ({
    articles: {
      ...state.articles,
      [articleStatistics.articleId]: articleStatistics,
    },
  });
};

export const setExerciseStatistics: (
  exercises: StatisticsSlice['exercises'],
) => PartialStateUpdater<StatisticsSlice> = (exercises) => {
  return () => ({
    exercises,
  });
};

export const setDayStatistics: (
  days: StatisticsSlice['days'],
) => PartialStateUpdater<StatisticsSlice> = (days) => {
  return () => ({
    days,
  });
};
