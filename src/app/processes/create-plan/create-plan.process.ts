import { CreatePlanProcess } from '.';
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

const process = 'createPlanProcess';
export function createPlanProcess({
  vaultStore,
  statisticsStore,
  exerciseStore,
  planStore,
}: {
  vaultStore: VaultStore;
  statisticsStore: StatisticsStore;
  exerciseStore: ExerciseStore;
  planStore: PlanStore;
}): CreatePlanProcess {
  return ({ forseRecreate } = { forseRecreate: false }) => {
    logDebug(`${process} - start`, { includeStack: true });

    if (!forseRecreate && (planStore.newList().length > 0 || planStore.repeatList().length > 0)) {
      logDebug(`${process} - early exit, plan already exists`, {
        payload: { forseRecreate, new: planStore.newList(), repeat: planStore.repeatList() },
      });
      return;
    }

    const configuration = exerciseStore.configuration();

    const indexArticles = vaultStore.articles();
    const articles = findArticles(configuration, indexArticles);
    logDebug(`${process} - got list`, { payload: { indexArticles, articles } });

    const articleStatistics = statisticsStore.articles();
    const exerciseStatistics = statisticsStore.exercises();
    articles.sort((articleA, articleB) => {
      const scoreA = articleStatistics[articleA.articleId]?.score ?? 5;
      const scoreB = articleStatistics[articleB.articleId]?.score ?? 5;
      if (scoreA === scoreB) {
        const daysA = articleStatistics[articleA.articleId]?.lastReviewInterval_days ?? 0;
        const daysB = articleStatistics[articleB.articleId]?.lastReviewInterval_days ?? 0;
        return daysA === daysB ? 0 : daysA > daysB ? -1 : 1;
      }

      return scoreA < scoreB ? -1 : 1;
    });
    logDebug(`${process} - sorted list`, { payload: { articles } });

    // new
    const alreadyReviewedNew = Object.values(exerciseStatistics)
      .filter(
        (article): article is VaultArticleExerciseStat => !!article && isToday(article.started),
      )
      .map(({ articleId }) => articleId);
    const newList = [
      ...alreadyReviewedNew,
      ...getFirstNRecords(
        articles,
        configuration.newArticlesPerDay - alreadyReviewedNew.length,
        ({ articleId }) =>
          !alreadyReviewedNew.includes(articleId) && !exerciseStatistics[articleId],
      ).map(({ articleId }) => articleId),
    ];

    // repeat
    const repeatsPerDay = configuration.newArticlesPerDay * (configuration.repeatTimes + 1);

    const failedList = Object.values(exerciseStatistics)
      .filter((record): record is VaultArticleExerciseStat => !!record)
      .filter(
        ({ articleId }) =>
          articleStatistics[articleId]?.lastResult === ReviewResultNegative &&
          !newList.includes(articleId),
      )
      .map(({ articleId }) => articleId);
    let repeatList = failedList;

    const incompleteCurrentList = Object.values(exerciseStatistics)
      .filter((record): record is VaultArticleExerciseStat => !!record)
      .filter(
        ({ articleId, started, repeates }) =>
          !!started &&
          articleStatistics[articleId]?.lastResult === ReviewResultIncomplete &&
          repeates.length < configuration.repeatTimes &&
          !newList.includes(articleId),
      )
      .map(({ articleId }) => articleId);
    repeatList = [
      ...repeatList,
      ...getFirstNRecords(
        incompleteCurrentList,
        repeatsPerDay - repeatList.length,
        (articleId) => !repeatList.includes(articleId),
      ),
    ];

    const incompleteWholeList = Object.values(exerciseStatistics)
      .filter((record): record is VaultArticleExerciseStat => !!record)
      .filter(
        ({ articleId }) =>
          articleStatistics[articleId]?.lastResult === ReviewResultIncomplete &&
          !newList.includes(articleId),
      )
      .map(({ articleId }) => articleId);
    repeatList = [
      ...repeatList,
      ...getFirstNRecords(
        incompleteWholeList,
        repeatsPerDay - repeatList.length,
        (articleId) => !repeatList.includes(articleId),
      ),
    ];

    // already repeated
    Object.values(exerciseStatistics)
      .filter(
        (article): article is VaultArticleExerciseStat =>
          (!!article && !!article.repeates.find((repeat) => isToday(repeat))) ||
          (!!article && !!article.consolidations.find(({ date }) => isToday(date))),
      )
      .forEach(({ articleId }) => {
        if (repeatList.includes(articleId) === false) repeatList.push(articleId);
      });

    // rest list
    const restList = Object.values(exerciseStatistics)
      .filter((record): record is VaultArticleExerciseStat => !!record)
      .filter(
        ({ articleId }) =>
          !newList.includes(articleId) &&
          !repeatList.includes(articleId) &&
          (statisticsStore.articles()[articleId]?.score ?? 0) < 5,
      )
      .map(({ articleId }) => articleStatistics[articleId])
      .sort((a, b) => ((a?.lastReview ?? new Date(0)) < (b?.lastReview ?? new Date(0)) ? -1 : 1))
      .filter((article) => !!article)
      .map(({ articleId }) => articleId);
    repeatList = [
      ...repeatList,
      ...getFirstNRecords(restList, repeatsPerDay - repeatList.length, () => true),
    ];

    planStore.patchPlan({ newList, repeatList });

    logDebug(`${process} - finished`);
  };
}
