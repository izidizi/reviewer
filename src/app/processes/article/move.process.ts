import { StatisticsStore } from '../../store/statistics/statistics.store';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { MoveArticleProcess } from '.';
import { ArticleId } from '../../model/article-id';
import { createPath } from '../../model/path';
import { ProcessError, ProcessNotImplementedError } from '../../../model/error/process-error';
import { ParseArticleIdBL } from '../../process-bl';
import { VaultStore } from '../../store/vault/vault.store';
import { VaultStateStore } from '../../store/vault-state/vault-state.store';
import { CacheStore } from '../../store/cache/cache.store';

export class InvalidArticleIdError extends ProcessError {
  constructor(articleId: ArticleId) {
    super({ process, message: `[${articleId}] is not found` });
  }
}

const process = 'moveArticleProcess';
export function moveArticleProcess({
  vault,
  vaultState,
  cache,
  exerciseStore,
  parseArticleId,
}: {
  vault: VaultStore;
  vaultState: VaultStateStore;
  cache: CacheStore;
  exerciseStore: ExerciseStore;
  parseArticleId: ParseArticleIdBL;
}): MoveArticleProcess {
  return (from, to) => {
    const { path: fromPath, name: fromName } = parseArticleId(from);
    const { path: toPath, name: toName } = parseArticleId(to);

    if (!fromName || !vault.articlesIndex[from]) throw new InvalidArticleIdError(from);
    if (!toName || !vault.articlesIndex[to]) throw new InvalidArticleIdError(to);

    throw new ProcessNotImplementedError({ process });

    // const reviews = statisticsStore.reviews().map((review) => {
    //   if (review.path !== createPath(fromPath) || review.name !== fromName) return review;

    //   return {
    //     ...review,
    //     path: createPath(toPath),
    //     name: toName,
    //   };
    // });
    // statisticsStore.setReviews(reviews);
    // statisticsStore.setIsUpdated();

    // TODO: update statisticsStore.articles
    // TODO: update statisticsStore.exercises

    // TODO: update exerciseStore.todayNew
    // TODO: update exerciseStore.todayRepeat
    // TODO: update exerciseStore.todayConsolidate

    // vaultIndexStore.deleteArticle(from);
  };
}
