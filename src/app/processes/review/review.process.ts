import { ExerciseStore } from '../../store/exercise/exercise.store';
import { ReviewProcess } from '.';
import { ArticleId } from '../../model/article-id';
import { ProcessError } from '../../../model/error/process-error';
import { createPath } from '../../model/path';
import { EnqueueReviewLogic } from '../../process-bl/enqueue-review';
import { logDebug } from '../../../services/debug-logger';
import { VaultStore } from '../../store/vault/vault.store';

export class ArticleNotFound extends ProcessError {
  constructor(articleId: ArticleId) {
    super({ process, message: `[${articleId}] is not found` });
  }
}

const process = 'ReviewProcess';
export function reviewProcess({
  vaultStore,
  exerciseStore,
  enqueueReview,
}: {
  vaultStore: VaultStore;
  exerciseStore: ExerciseStore;
  enqueueReview: EnqueueReviewLogic;
}): ReviewProcess {
  return (articleId, result) => {
    logDebug(`${process} - start`, {
      includeStack: true,
      entity: `[${articleId}] review ${result}`,
    });

    const article = vaultStore.article(articleId)();
    if (!article) throw new ArticleNotFound(articleId);

    enqueueReview(articleId, {
      name: article.name,
      path: createPath(article.path),
      result,
    });

    const todayNew = exerciseStore
      .todayNew()
      .filter((todayArticleId) => todayArticleId !== articleId);
    const todayRepeat = exerciseStore
      .todayRepeat()
      .filter((todayArticleId) => todayArticleId !== articleId);
    const todayConsolidate = exerciseStore
      .todayConsolidate()
      .filter((todayArticleId) => todayArticleId !== articleId);

    exerciseStore.setTodayConfiguration({
      todayNew,
      todayRepeat,
      todayConsolidate,
    });

    logDebug(`${process} - finish`, { entity: `[${articleId}] review ${result}` });
  };
}
