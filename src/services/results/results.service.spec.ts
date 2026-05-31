import { TestBed } from '@angular/core/testing';
import { ResultsService } from './results.service';
import { VaultArticle } from '../../app/model/vault-article';
import { ArticleId, getArticleId } from '../../app/model/article-id';
import { DriveId } from '../../app/model/drive-id';
import { ReviewStorage } from '../../model/storage/review';
import { VaultArticleStatistics } from '../../app/model/vault-article-statistics';
import { ISO8601String } from '../../model/utils';
import {
  ReviewResultIncomplete,
  ReviewResultNegative,
  ReviewResultPositive,
} from '../../app/model/review-result';

describe('ResultsService', () => {
  let service: ResultsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [ResultsService],
    }).compileComponents();

    service = TestBed.inject(ResultsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('parseArticle positive scenario', () => {
    const testData: ReviewStorage[] = [
      {
        name: '1',
        path: 'a/b',
        result: 'positive',
        reviewed: '2026-05-28T10:24:50.276Z' as ISO8601String,
      },
      {
        name: '1',
        path: 'a/b',
        result: 'negative',
        reviewed: '2026-05-27T10:24:50.276Z' as ISO8601String,
      },
      {
        name: '1',
        path: 'a/b',
        result: 'negative',
        reviewed: '2026-05-25T10:24:50.276Z' as ISO8601String,
      },
      {
        name: '2',
        path: 'a/b',
        result: 'positive',
        reviewed: '2026-05-25T10:23:00.000Z' as ISO8601String,
      },
    ];

    const articleId = getArticleId(testData[0].path, testData[0].name);
    let result: {
      [articleId: ArticleId]: VaultArticleStatistics | undefined;
    };
    beforeEach(() => {
      result = service.processResults(testData);
      console.log(result);
    });

    it('should generate statistics', () => {
      expect(result).toBeTruthy();
    });

    it('should contains statistics for test data file', () => {
      expect(result[articleId]).toBeTruthy();
    });

    it('should set articleId', () => {
      const articleStatistics = result[articleId]!;
      expect(articleStatistics.articleId).toEqual(articleId);
    });

    it('should set lastResult', () => {
      const articleStatistics = result[articleId]!;
      expect(articleStatistics.lastResult).toEqual(ReviewResultPositive);
    });

    it('should set lastResult', () => {
      const articleStatistics = result[articleId]!;
      const maxDate = Math.max.apply(
        null,
        testData.map(({ reviewed }) => new Date(reviewed).getTime()),
      );
      expect(articleStatistics.lastReview).toEqual(new Date(maxDate));
    });

    it('should total.positive', () => {
      const articleStatistics = result[articleId]!;
      const total = testData
        .filter(({ path, name }) => getArticleId(path, name) === articleId)

        .reduce((total, { result }) => (result === ReviewResultPositive ? total + 1 : total), 0);
      expect(articleStatistics.total.positive).toEqual(total);
    });

    it('should total.incomplete', () => {
      const articleStatistics = result[articleId]!;
      const total = testData
        .filter(({ path, name }) => getArticleId(path, name) === articleId)
        .reduce((total, { result }) => (result === ReviewResultIncomplete ? total + 1 : total), 0);
      expect(articleStatistics.total.incomplete).toEqual(total);
    });

    it('should total.negative', () => {
      const articleStatistics = result[articleId]!;
      const total = testData
        .filter(({ path, name }) => getArticleId(path, name) === articleId)
        .reduce((total, { result }) => (result === ReviewResultNegative ? total + 1 : total), 0);
      expect(articleStatistics.total.negative).toEqual(total);
    });

    it('should set lastResult', () => {
      const articleStatistics = result[articleId]!;
      expect((articleStatistics.lastReviewInterval_days ?? 0) - 1).toBeLessThan(0.01);
    });
  });
});
