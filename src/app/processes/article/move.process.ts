import { StatisticsStore } from '../../store/statistics/statistics.store';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { MoveArticleProcess } from '.';
import { VaultIndexStore } from '../../store/vault-index/vault-index.store';
import { ArticleId } from '../../model/article-id';
import { createPath } from '../../model/path';
import { ProcessError } from '../../../model/error/process-error';
import { ParseArticleIdBL } from '../../process-bl';

export class InvalidArticleIdError extends ProcessError {
  constructor(articleId: ArticleId) {
    super({ process: 'moveArticleProcess', message: `[${articleId}] is not found` });
  }
}
export function moveArticleProcess({
  vaultIndexStore,
  statisticsStore,
  exerciseStore,
  parseArticleId,
}: {
  vaultIndexStore: VaultIndexStore;
  statisticsStore: StatisticsStore;
  exerciseStore: ExerciseStore;
  parseArticleId: ParseArticleIdBL;
}): MoveArticleProcess {
  return (from, to) => {
    const { path: fromPath, name: fromName } = parseArticleId(from);
    const { path: toPath, name: toName } = parseArticleId(to);

    if (!fromName || !vaultIndexStore.articles[from]) throw new InvalidArticleIdError(from);
    if (!toName || !vaultIndexStore.articles[to]) throw new InvalidArticleIdError(to);

    const reviews = statisticsStore.reviews().map((review) => {
      if (review.path !== createPath(fromPath) || review.name !== fromName) return review;

      return {
        ...review,
        path: createPath(toPath),
        name: toName,
      };
    });
    statisticsStore.setReviews(reviews);
    statisticsStore.setIsUpdated();

    // TODO: update statisticsStore.articles
    // TODO: update statisticsStore.exercises

    // TODO: update exerciseStore.todayNew
    // TODO: update exerciseStore.todayRepeat
    // TODO: update exerciseStore.todayConsolidate

    vaultIndexStore.deleteArticle(from);
  };
}
