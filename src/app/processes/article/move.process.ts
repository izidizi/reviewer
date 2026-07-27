import { ArticleId } from '../../model/article-id';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { MoveArticleProcess } from '.';
import { createPath } from '../../model/path';
import { ProcessError, ProcessNotImplementedError } from '../../../model/error/process-error';
import { ParseArticleIdLogic } from '../../process-bl';
import { VaultStore } from '../../store/vault/vault.store';
import { VaultStateStore } from '../../store/vault-state/vault-state.store';
import { CacheStore } from '../../store/cache/cache.store';
import { PlanStore } from '../../store/plan/plan.store';
import { FeatureIndexStore } from '../../features/index/index.store';
import { ReviewProcess } from '../review';

export class ArticleIdNotFoundError extends ProcessError {
  constructor(articleId: ArticleId, direction: 'source' | 'destination') {
    super({
      process,
      message: `${direction} article [${articleId}] not found`,
    });
  }
}

const process = 'moveArticleProcess';
export function moveArticleProcess({
  vault,
  statistics,
  vaultState,
  cache,
  exerciseStore,
  parseArticleId,
}: {
  vault: VaultStore;
  vaultState: VaultStateStore;
  cache: CacheStore;
  exerciseStore: ExerciseStore;
  statistics: StatisticsStore;
  plan: PlanStore;
  featureIndexStore: FeatureIndexStore;
  parseArticleId: ParseArticleIdLogic;
}): MoveArticleProcess {
  return (from, to) => {
    const { path: fromPath, name: fromName } = parseArticleId(from);
    const { path: toPath, name: toName } = parseArticleId(to);

    if (!fromName || !vault.articlesIndex[from]) throw new ArticleIdNotFoundError(from, 'source');
    if (!toName || !vault.articlesIndex[to]) throw new ArticleIdNotFoundError(to, 'destination');

    statistics.removeArticle({ articleId: from });
    statistics.removeArticle({ articleId: to });

    vault.removeArticle({ articleId: from, hasChanges: true });

    const fromReviews = vault.reviewsIndex()[from] ?? [];
    fromReviews.forEach(({ reviewed, result }) =>
      vault.addReview({
        articleId: to,
        review: {
          path: createPath(toPath),
          name: toName,
          reviewed,
          result,
        },
      }),
    );
    vault.removeReviews({ articleId: from });

    // TODO: update all other stores

    vaultState.setHasChanges({ hasChanges: true });
  };
}
