import { ArticleId } from '../../model/article-id';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { DeleteArticleProcess } from '.';
import { ProcessError } from '../../../model/error/process-error';
import { VaultStore } from '../../store/vault/vault.store';
import { VaultStateStore } from '../../store/vault-state/vault-state.store';
import { CacheStore } from '../../store/cache/cache.store';
import { PlanStore } from '../../store/plan/plan.store';

export class ArticleIdNotFoundError extends ProcessError {
  constructor(articleId: ArticleId, direction: 'source' | 'destination') {
    super({
      process,
      message: `${direction} article [${articleId}] not found`,
    });
  }
}

const process = 'DeleteArticleProcess';
export function deleteArticleProcess({
  vault,
  vaultState,
  cache,
  statistics,
  plan,
}: {
  vault: VaultStore;
  vaultState: VaultStateStore;
  cache: CacheStore;
  statistics: StatisticsStore;
  plan: PlanStore;
}): DeleteArticleProcess {
  return (articleId) => {
    statistics.removeArticle({ articleId });
    vault.removeArticle({ articleId });
    vault.removeReviews({ articleId });
    cache.removeArticle({ articleId });
    plan.removeArticle({ articleId });
    vaultState.setHasChanges({ hasChanges: true });
  };
}
