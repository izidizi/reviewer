import { ArticleId } from '../../model/article-id';

export interface ExerciseSlice {
  startDate: Date;

  includeTags: string[];
  includeTopics: string[];

  excludeTags: string[];
  excludeTopics: string[];

  newArticlesPerDay: number;
  repeatTimes: number;

  todayNew: ArticleId[];
  todayRepeat: ArticleId[];
  todayConsolidate: ArticleId[];
}

export const initialExerciseSlice: ExerciseSlice = {
  startDate: new Date('2026-05-28'),

  includeTags: [],
  includeTopics: [],

  excludeTags: [],
  excludeTopics: [],

  newArticlesPerDay: 3,
  repeatTimes: 2,

  todayNew: [],
  todayRepeat: [],
  todayConsolidate: [],
};
