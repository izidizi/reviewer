import { ReviewStorage } from '../../../model/storage/review';
import {
  VaultIndexArticleStorage,
  VaultIndexExerciseConfiguration,
} from '../../../model/storage/vault-index';
import { EmptyISO8601String } from '../../../model/utils/iso8601-string';
import { ArticleId } from '../../model/article-id';

export interface VaultSlice {
  articlesIndex: { [articleId: ArticleId]: VaultIndexArticleStorage | undefined };
  exerciseConfiguration: VaultIndexExerciseConfiguration;
  reviewsIndex: { [articleId: ArticleId]: ReviewStorage[] | undefined };
}

export const initialVaultSlice: VaultSlice = {
  articlesIndex: {},
  exerciseConfiguration: {
    startDate: '' as EmptyISO8601String,
    includeTags: [],
    includeTopics: [],
    excludeTags: [],
    excludeTopics: [],
    newArticlesPerDay: 3,
    repeatTimes: 3,
  },
  reviewsIndex: {},
};
