import { Injectable } from '@angular/core';
import { ReviewStorage } from '../../model/storage/review';
import { ArticleId, getArticleId } from '../../app/model/article-id';
import { VaultArticleStatistics } from '../../app/model/vault-article-statistics';
import { isReviewResult, ReviewResultUnknown } from '../../app/model/review-result';
import { isISO8601String } from '../../model/utils';
import { VaultArticleExerciseStat } from '../../app/model/vault-article-exercise-stat';
import { ExerciseSlice } from '../../app/store/exercise/exercise.slice';
import { ISO8601DateString, toISO6801DateString } from '../../model/utils/iso8601-string';
import { VaultDayStatistics } from '../../app/model/vault-day-statistics';

@Injectable({
  providedIn: 'root',
})
export class ResultsService {
  processResults(
    reviews: readonly ReviewStorage[],
    excerciseConfiguration: Pick<ExerciseSlice, 'startDate' | 'repeatTimes'>,
  ): {
    articles: { [articleId: ArticleId]: VaultArticleStatistics | undefined };
    excersises: {
      [articleId: ArticleId]: VaultArticleExerciseStat | undefined;
    };
    days: {
      [day: ISO8601DateString]: VaultDayStatistics | undefined;
    };
  } {
    const articles: { [articleId: ArticleId]: VaultArticleStatistics | undefined } = {};
    const excersises: {
      [articleId: ArticleId]: VaultArticleExerciseStat | undefined;
    } = {};
    const days: {
      [day: ISO8601DateString]: VaultDayStatistics | undefined;
    } = {};

    [...reviews]
      .sort((a, b) => (a.reviewed < b.reviewed ? -1 : 1))
      .forEach((review, index) => {
        const articleId = getArticleId(review.path, review.name);
        if (isReviewResult(review.result) && isISO8601String(review.reviewed)) {
          const articleStatistics = this.updateArticleStatistics(review, articles[articleId]);
          articles[articleId] = articleStatistics;

          const articleExerciseStatistics = this.updateArticleExerciseStat(
            review,
            excerciseConfiguration,
            excersises[articleId],
          );
          excersises[articleId] = articleExerciseStatistics;

          const dayStatistics = this.updateDayStatistics(
            review,
            days[toISO6801DateString(review.reviewed)],
          );
          days[dayStatistics.date] = dayStatistics;
        } else {
          console.log(`review #${index} has been skipped`);
        }
      });

    return {
      articles,
      excersises,
      days,
    };
  }

  updateArticleStatistics(
    review: ReviewStorage,
    articleStatistics?: VaultArticleStatistics,
  ): VaultArticleStatistics {
    const reviewed = new Date(review.reviewed);
    const result = isReviewResult(review.result) ? review.result : ReviewResultUnknown;

    const lastResult =
      (articleStatistics?.lastReview ?? 0) > reviewed ? articleStatistics!.lastResult : result;
    const lastReview =
      (articleStatistics?.lastReview ?? 0) > reviewed ? articleStatistics!.lastReview : reviewed;

    const total: VaultArticleStatistics['total'] = {
      incomplete: articleStatistics?.total.incomplete ?? 0,
      negative: articleStatistics?.total.negative ?? 0,
      positive: articleStatistics?.total.positive ?? 0,
      unknown: articleStatistics?.total.unknown ?? 0,
    };
    total[result] += 1;

    const lastReviewInterval_days = (Date.now() - lastReview.getTime()) / 1000 / 60 / 60 / 24;

    return {
      articleId: articleStatistics?.articleId ?? getArticleId(review.path, review.name),
      lastResult,
      lastReview,
      total,
      lastReviewInterval_days,
    };
  }

  updateArticleExerciseStat(
    review: ReviewStorage,
    { startDate, repeatTimes }: Pick<ExerciseSlice, 'startDate' | 'repeatTimes'>,
    articleExerciseStat?: VaultArticleExerciseStat,
  ): VaultArticleExerciseStat | undefined {
    const reviewed = new Date(review.reviewed);
    const result = isReviewResult(review.result) ? review.result : ReviewResultUnknown;

    if (reviewed < startDate) return articleExerciseStat;

    let mode: 'new' | 'repeat' | 'consolidation';
    if (!articleExerciseStat) {
      mode = 'new';
    } else if (articleExerciseStat.repeates.length < repeatTimes) {
      mode = 'repeat';
    } else {
      mode = 'consolidation';
    }

    return {
      articleId: articleExerciseStat?.articleId ?? getArticleId(review.path, review.name),
      started: mode === 'new' ? reviewed : articleExerciseStat!.started,
      startResult: mode === 'new' ? result : articleExerciseStat!.startResult,
      repeates:
        mode === 'repeat'
          ? [...(articleExerciseStat?.repeates ?? []), reviewed]
          : (articleExerciseStat?.repeates ?? []),
      consolidations:
        mode === 'consolidation'
          ? [...(articleExerciseStat?.consolidations ?? []), { date: reviewed, result }]
          : (articleExerciseStat?.consolidations ?? []),
    };
  }

  updateDayStatistics(
    { path, name, reviewed, result }: ReviewStorage,
    dayStatistics?: VaultDayStatistics,
  ): VaultDayStatistics {
    const reviews = dayStatistics?.reviews ?? [];

    return {
      date: toISO6801DateString(reviewed),
      reviews: [
        ...reviews,
        {
          articleId: getArticleId(path, name),
          reviewed: new Date(reviewed),
          result: isReviewResult(result) ? result : 'unknown',
        },
      ],
    };
  }
}
