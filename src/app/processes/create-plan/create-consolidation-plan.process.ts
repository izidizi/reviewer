import { CreateConsolidationPlanProcess } from '.';
import { logDebug } from '../../../services/debug-logger';
import { isToday } from '../../helpers';
import { ReviewResultIncomplete, ReviewResultNegative } from '../../model/review-result';
import { VaultArticleExerciseStat } from '../../model/vault-article-exercise-stat';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { PlanStore } from '../../store/plan/plan.store';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { VaultStore } from '../../store/vault/vault.store';
import { findArticles } from './find-articles';
import { getFirstNRecords } from './get-n-records';

const process = 'createConsolidationPlanProcess';
export function createConsolidationPlanProcess({
  vaultStore,
  statisticsStore,
  exerciseStore,
  planStore,
}: {
  vaultStore: VaultStore;
  statisticsStore: StatisticsStore;
  exerciseStore: ExerciseStore;
  planStore: PlanStore;
}): CreateConsolidationPlanProcess {
  return ({ forceRecreate } = { forceRecreate: false }) => {
    logDebug(`${process} - start`, { includeStack: true });

    if (!forceRecreate && planStore.consolidateList().length > 0) {
      logDebug(`${process} - early exit, plan already exists`, {
        payload: { forceRecreate, new: planStore.consolidateList() },
      });
      return;
    }

    const configuration = exerciseStore.configuration();

    const indexArticles = vaultStore.articles();
    const articles = findArticles(configuration, indexArticles);
    logDebug(`${process} - got list`, { payload: { indexArticles, articles } });

    const articleStatistics = statisticsStore.articles();
    articles.sort((articleA, articleB) => {
      const daysA = articleStatistics[articleA.articleId]?.lastReviewInterval_days ?? 0;
      const daysB = articleStatistics[articleB.articleId]?.lastReviewInterval_days ?? 0;
      return daysA === daysB ? 0 : daysA > daysB ? -1 : 1;
    });
    logDebug(`${process} - sorted list`, { payload: { articles } });

    const consolidatesPerDay = configuration.newArticlesPerDay * (configuration.repeatTimes + 1);
    const consolidateList = getFirstNRecords(
      articles.map(({ articleId }) => articleId),
      consolidatesPerDay,
      (articleId) => true,
    );

    planStore.patchConsolidatePlan({ consolidateList });

    logDebug(`${process} - finished`);
  };
}
