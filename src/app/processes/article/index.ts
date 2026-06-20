import { inject, InjectionToken } from '@angular/core';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { VaultIndexStore } from '../../store/vault-index/vault-index.store';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { moveArticleProcess } from './move.process';
import { ArticleId } from '../../model/article-id';
import { DriveApiService } from '../../../services/drive-api';
import { ArticleService } from '../../../services/article/article.service';
import { getArticleContentProcess } from './get-content';
import { CheckAuthBL, ParseArticleIdBL } from '../../process-bl';

export type MoveArticleProcess = (from: ArticleId, to: ArticleId) => void;
export const MoveArticleProcess = new InjectionToken<MoveArticleProcess>('MoveArticleProcess', {
  providedIn: 'root',
  factory: () => {
    const vaultIndexStore = inject(VaultIndexStore);
    const statisticsStore = inject(StatisticsStore);
    const exerciseStore = inject(ExerciseStore);
    const parseArticleId = inject(ParseArticleIdBL);

    return moveArticleProcess({ vaultIndexStore, statisticsStore, exerciseStore, parseArticleId });
  },
});

export type GetArticleContentProcess = (articleId: ArticleId) => Promise<string | null>;
export const GetArticleContentProcess = new InjectionToken<GetArticleContentProcess>(
  'GetArticleContentProcess',
  {
    providedIn: 'root',
    factory: () => {
      const driveApi = inject(DriveApiService);
      const parseArticleId = inject(ParseArticleIdBL);
      const checkAuth = inject(CheckAuthBL);

      const vaultIndexStore = inject(VaultIndexStore);
      const articleService = inject(ArticleService);

      return getArticleContentProcess({
        driveApi,
        parseArticleId,
        checkAuth,
        vaultIndexStore,
        articleService,
      });
    },
  },
);
