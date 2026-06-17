import { ISO8601String } from '../utils';
import { EmptyISO8601String } from '../utils/iso8601-string';

export type VaultIndexStorage = {
  articles: VaultIndexArticleStorage[];
  exerciseConfiguration: VaultIndexExerciseConfiguration;
};

export type VaultIndexArticleStorage = {
  driveId: string;
  path: string;
  name: string;
  tags: string[];
  topics: string[];
  indexed: ISO8601String | EmptyISO8601String;
  created?: ISO8601String | EmptyISO8601String;
};

export type VaultIndexExerciseConfiguration = {
  startDate: ISO8601String | EmptyISO8601String;

  includeTags: string[];
  includeTopics: string[];

  excludeTags: string[];
  excludeTopics: string[];

  newArticlesPerDay: number;
  repeatTimes: number;
};
