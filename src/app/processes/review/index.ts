import { inject, InjectionToken } from '@angular/core';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { VaultIndexStore } from '../../store/vault-index/vault-index.store';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { reviewProcess } from './review.process';
import { ArticleId } from '../../model/article-id';
import { ReviewResult } from '../../model/review-result';
import { ResultsService } from '../../../services/results/results.service';

export type ReviewProcess = (article: ArticleId, result: ReviewResult) => void;
export const ReviewProcess = new InjectionToken<ReviewProcess>('ResultProcess', {
  providedIn: 'root',
  factory: () => {
    const vaultIndexStore = inject(VaultIndexStore);
    const statisticsStore = inject(StatisticsStore);
    const exerciseStore = inject(ExerciseStore);
    const resultsService = inject(ResultsService);

    return reviewProcess({ vaultIndexStore, statisticsStore, exerciseStore, resultsService });
  },
});
