import { ISO8601DateString } from '../../../model/utils/iso8601-string';
import { ArticleId } from '../../model/article-id';
import { VaultArticleExerciseStat } from '../../model/vault-article-exercise-stat';
import { VaultArticleStatistics } from '../../model/vault-article-statistics';
import { VaultDayStatistics } from '../../model/vault-day-statistics';

export type StatisticsSlice = {
  articles: { [acticleId: ArticleId]: VaultArticleStatistics | undefined };
  exercises: { [articleId: ArticleId]: VaultArticleExerciseStat | undefined };
  days: { [date: ISO8601DateString]: VaultDayStatistics | undefined };
};

export const initialStatisticsSlice: StatisticsSlice = {
  articles: {},
  exercises: {},
  days: {},
};
