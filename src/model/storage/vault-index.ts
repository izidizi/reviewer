import { ISO8601String } from '../utils';
import { EmptyISO8601String } from '../utils/iso8601-string';

export type VaultIndexStorage = {
  articles: VaultIndexArticleStorage[];
  exerciseConfiguration: ValudIndexExerciseConfiguration;
};

export type VaultIndexArticleStorage = {
  driveId: string;
  path: string;
  name: string;
  tags: string[];
  topics: string[];
  indexed: ISO8601String | EmptyISO8601String;
};

export type ValudIndexExerciseConfiguration = {
  startDate: string;

  includeTags: string[];
  includeTopics: string[];

  excludeTags: string[];
  excludeTopics: string[];

  newArticlesPerDay: number;
  repeatTimes: number;
};
