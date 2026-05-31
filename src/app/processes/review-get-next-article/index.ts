import { inject, InjectionToken } from '@angular/core';
import { VaultIndexStore } from '../../store/vault-index/vault-index.store';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { reviewGetNextArticleProcess } from './review-get-next-article.process';
import { ArticleId } from '../../model/article-id';

export type ReviewGetNextArticleProcess = () => ArticleId | null;
export const ReviewGetNextArticleProcess = new InjectionToken<ReviewGetNextArticleProcess>(
  'ResultProcess',
  {
    providedIn: 'root',
    factory: () => {
      const vaultIndexStore = inject(VaultIndexStore);
      const exerciseStore = inject(ExerciseStore);

      return reviewGetNextArticleProcess({ vaultIndexStore, exerciseStore });
    },
  },
);
