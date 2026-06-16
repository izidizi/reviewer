import { StatisticsStore } from '../../store/statistics/statistics.store';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { CreateTodaysPlan } from '.';
import { VaultIndexStore } from '../../store/vault-index/vault-index.store';
import { findArticles } from './find-articles';
import { isToday } from '../../helpers';
import { ReviewResultPositive } from '../../model/review-result';

export function createTodaysPlanProcess({
  vaultIndexStore,
  statisticsStore,
  exerciseStore,
}: {
  vaultIndexStore: VaultIndexStore;
  statisticsStore: StatisticsStore;
  exerciseStore: ExerciseStore;
}): CreateTodaysPlan {
  return () => {
    const configuration = exerciseStore.configuration();

    const articlesIndex = vaultIndexStore.articles();
    const articles = findArticles(
      configuration,
      Object.values(articlesIndex).filter((article) => !!article),
    );

    const articleStatistics = statisticsStore.articles();
    const exerciseStatistics = statisticsStore.exercises();
    articles.sort((articleA, articleB) => {
      const daysA = articleStatistics[articleA.articleId]?.lastReviewInterval_days ?? 0;
      const daysB = articleStatistics[articleB.articleId]?.lastReviewInterval_days ?? 0;
      if (daysA === daysB) {
        const topicA = articleA.topics[0] ?? 'x';
        const topicB = articleB.topics[0] ?? 'x';
        return topicA === topicB ? 0 : topicA < topicB ? -1 : 1;
      }

      return daysA > daysB ? -1 : 1;
    });

    // new
    const alreadyDoneNew = Object.values(exerciseStatistics).filter(
      (article) => article && isToday(article.started),
    ).length;
    const todayNew = articles
      .filter(({ articleId }) => !exerciseStatistics[articleId])
      .slice(
        0,
        alreadyDoneNew < configuration.newArticlesPerDay
          ? configuration.newArticlesPerDay - alreadyDoneNew
          : 0,
      )
      .map(({ articleId }) => articleId);

    // repeat
    const alreadyDoneRepeat = Object.values(exerciseStatistics).filter((article) => {
      if (!article) return false;
      for (const repeat of article.repeates) {
        if (isToday(repeat)) return true;
      }

      return false;
    }).length;
    const repeatArticles = articles
      .filter(
        ({ articleId }) =>
          exerciseStatistics[articleId]?.started &&
          !isToday(exerciseStatistics[articleId]?.started) &&
          // exerciseStatistics[articleId]?.startResult !== ReviewResultPositive &&
          exerciseStatistics[articleId]?.repeates.length < configuration.repeatTimes,
      )
      .sort(({ articleId: idA }, { articleId: idB }) =>
        exerciseStatistics[idA]!.started < exerciseStatistics[idB]!.started ? -1 : 1,
      );
    const todayRepeat = repeatArticles
      .slice(0, configuration.newArticlesPerDay)
      .map(({ articleId }) => articleId);

    // consolidate
    const consolidateArticles = articles
      .filter(({ articleId }) => {
        if (!exerciseStatistics[articleId]) return false;
        if (!exerciseStatistics[articleId].started) return false;
        if (isToday(exerciseStatistics[articleId].started)) return false;
        if (
          exerciseStatistics[articleId].startResult !== ReviewResultPositive &&
          exerciseStatistics[articleId].repeates.length < configuration.repeatTimes
        )
          return false;

        if (todayNew.includes(articleId)) return false;
        if (todayRepeat.includes(articleId)) return false;

        for (const date of exerciseStatistics[articleId].repeates) {
          if (isToday(date)) return false;
        }
        for (const { date } of exerciseStatistics[articleId].consolidations) {
          if (isToday(date)) return false;
        }

        return true;
      })
      .sort(({ articleId: idA }, { articleId: idB }) => {
        const articleStatisticsA = exerciseStatistics[idA];
        const articleStatisticsB = exerciseStatistics[idB];

        const numberOfNegativeResultsA = articleStatisticsA!.consolidations.filter(
          ({ result }) => result === 'negative',
        ).length;
        const numberOfNegativeResultsB = articleStatisticsB!.consolidations.filter(
          ({ result }) => result === 'negative',
        ).length;
        if (numberOfNegativeResultsA !== numberOfNegativeResultsB)
          return numberOfNegativeResultsA > numberOfNegativeResultsB ? -1 : 1;

        const numberOfIncompleteResultsA = articleStatisticsA!.consolidations.filter(
          ({ result }) => result === 'incomplete',
        ).length;
        const numberOfIncompleteResultsB = articleStatisticsB!.consolidations.filter(
          ({ result }) => result === 'incomplete',
        ).length;
        if (numberOfIncompleteResultsA !== numberOfIncompleteResultsB)
          return numberOfIncompleteResultsA > numberOfIncompleteResultsB ? -1 : 1;

        if (
          articleStatisticsA!.consolidations.length !== articleStatisticsB!.consolidations.length
        ) {
          return articleStatisticsA!.consolidations.length <
            articleStatisticsB!.consolidations.length
            ? -1
            : 1;
        }

        return exerciseStatistics[idA]!.started < exerciseStatistics[idB]!.started ? -1 : 1;
      });
    const todayConsolidate = consolidateArticles
      .slice(0, 2 * configuration.newArticlesPerDay)
      .map(({ articleId }) => articleId);

    exerciseStore.setTodayConfiguration({
      todayNew,
      todayRepeat,
      todayConsolidate,
    });
  };
}
