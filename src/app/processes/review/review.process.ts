import { StatisticsStore } from '../../store/statistics/statistics.store';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { VaultIndexStore } from '../../store/vault-index/vault-index.store';
import { ReviewProcess } from '.';
import { ReviewStorage } from '../../../model/storage/review';
import { ArticleId } from '../../model/article-id';
import { ProcessError } from '../../../model/error/process-error';
import { createPath } from '../../model/path';
import { dateToISO80601String, ISO8601String } from '../../../model/utils';
import { ResultsService } from '../../../services/results/results.service';

export class ArticleNotFound extends ProcessError {
  constructor(articleId: ArticleId) {
    super({ process: 'ReviewProcess', message: `[${articleId}] is not found` });
  }
}

export function reviewProcess({
  vaultIndexStore,
  statisticsStore,
  exerciseStore,
  resultsService,
}: {
  vaultIndexStore: VaultIndexStore;
  statisticsStore: StatisticsStore;
  exerciseStore: ExerciseStore;
  resultsService: ResultsService;
}): ReviewProcess {
  return (articleId, result) => {
    const article = vaultIndexStore.articles()[articleId];
    if (!article) throw new ArticleNotFound(articleId);

    const review: ReviewStorage = {
      name: article.name,
      path: createPath(article.path),
      result,
      reviewed: dateToISO80601String(new Date()) as ISO8601String,
    };

    statisticsStore.addReview(review);

    // statistics
    const articleStatistics = resultsService.updateArticleStatistics(
      review,
      statisticsStore.articles()[articleId],
    );
    statisticsStore.addStatistics(articleStatistics);

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
  };
}
