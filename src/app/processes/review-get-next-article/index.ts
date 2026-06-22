import { inject, InjectionToken } from '@angular/core';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { reviewGetNextArticleProcess } from './review-get-next-article.process';
import { ArticleId } from '../../model/article-id';
import { VaultStore } from '../../store/vault/vault.store';

export type ReviewGetNextArticleProcess = () => ArticleId | null;
export const ReviewGetNextArticleProcess = new InjectionToken<ReviewGetNextArticleProcess>(
  'ResultProcess',
  {
    providedIn: 'root',
    factory: () => {
      const vaultStore = inject(VaultStore);
      const exerciseStore = inject(ExerciseStore);

      return reviewGetNextArticleProcess({ vaultStore, exerciseStore });
    },
  },
);
