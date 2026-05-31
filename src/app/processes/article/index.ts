import { inject, InjectionToken } from '@angular/core';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { VaultIndexStore } from '../../store/vault-index/vault-index.store';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { moveArticleProcess } from './move.process';
import { ArticleId } from '../../model/article-id';
import { DriveApiService } from '../../../services';
import { LogoutProcess } from '../logout.process';
import { CheckAuthProcess } from '../check-auth.process';
import { ArticleService } from '../../../services/article/article.service';
import { getArticleContentProcess } from './get-content';

export type MoveArticleProcess = (from: ArticleId, to: ArticleId) => void;
export const MoveArticleProcess = new InjectionToken<MoveArticleProcess>('MoveArticleProcess', {
  providedIn: 'root',
  factory: () => {
    const vaultIndexStore = inject(VaultIndexStore);
    const statisticsStore = inject(StatisticsStore);
    const exerciseStore = inject(ExerciseStore);

    return moveArticleProcess({ vaultIndexStore, statisticsStore, exerciseStore });
  },
});

export type GetArticleContentProcess = (articleId: ArticleId) => Promise<string | null>;
export const GetArticleContentProcess = new InjectionToken<GetArticleContentProcess>(
  'GetArticleContentProcess',
  {
    providedIn: 'root',
    factory: () => {
      const driveApi = inject(DriveApiService);
      const logoutProcess = inject(LogoutProcess);
      const checkAuthProcess = inject(CheckAuthProcess);
      const vaultIndexStore = inject(VaultIndexStore);
      const articleService = inject(ArticleService);

      return getArticleContentProcess({
        driveApi,
        logoutProcess,
        checkAuthProcess,
        vaultIndexStore,
        articleService,
      });
    },
  },
);
