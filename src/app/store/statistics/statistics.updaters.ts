import { PartialStateUpdater } from '@ngrx/signals';
import { VaultArticleStatistics } from '../../model/vault-article-statistics';
import { StatisticsSlice } from './statistics.slice';
import { VaultArticleExerciseStat } from '../../model/vault-article-exercise-stat';
import { VaultDayStatistics } from '../../model/vault-day-statistics';

export type SetArticleData = { articleStatistics: VaultArticleStatistics };
export const setArticle: (data: SetArticleData) => PartialStateUpdater<StatisticsSlice> =
  ({ articleStatistics }) =>
  (state) => ({
    articles: { ...state.articles, [articleStatistics.articleId]: articleStatistics },
  });

export type SetExerciseData = { exerciseStatistics: VaultArticleExerciseStat };
export const setExercise: (data: SetExerciseData) => PartialStateUpdater<StatisticsSlice> =
  ({ exerciseStatistics }) =>
  (state) => ({
    exercises: { ...state.exercises, [exerciseStatistics.articleId]: exerciseStatistics },
  });

export type SetDayData = { dayStatistics: VaultDayStatistics };
export const setDay: (data: SetDayData) => PartialStateUpdater<StatisticsSlice> =
  ({ dayStatistics }) =>
  (state) => ({
    days: { ...state.days, [dayStatistics.date]: dayStatistics },
  });
