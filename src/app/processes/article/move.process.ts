import { StatisticsStore } from '../../store/statistics/statistics.store';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { MoveArticleProcess } from '.';
import { VaultIndexStore } from '../../store/vault-index/vault-index.store';
import { ArticleId, parseArticleId } from '../../model/article-id';
import { createPath } from '../../model/path';
import { ProcessError } from '../../../model/error/process-error';

export class InvalidArticleIdError extends ProcessError {
  constructor(articleId: ArticleId) {
    super({ process: 'moveArticleProcess', message: `[${articleId}] is not found` });
  }
}
export function moveArticleProcess({
  vaultIndexStore,
  statisticsStore,
  exerciseStore,
}: {
  vaultIndexStore: VaultIndexStore;
  statisticsStore: StatisticsStore;
  exerciseStore: ExerciseStore;
}): MoveArticleProcess {
  return (from, to) => {
    const { path: fromPath, name: fromName } = parseArticleId(from);
    const { path: toPath, name: toName } = parseArticleId(to);

    if (!fromName) throw new InvalidArticleIdError(from);
    if (!toName) throw new InvalidArticleIdError(to);

    const reviews = statisticsStore.reviews().map((review) => {
      if (review.path !== createPath(fromPath) || review.name !== fromName) return review;

      return {
        ...review,
        path: createPath(toPath),
        name: toName,
      };
    });
    statisticsStore.setReviews(reviews);

    // TODO: update statisticsStore.articles
    // TODO: update statisticsStore.exercises

    // TODO: update exerciseStore.todayNew
    // TODO: update exerciseStore.todayRepeat
    // TODO: update exerciseStore.todayConsolidate
  };
}
