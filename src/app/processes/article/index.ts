import { inject, InjectionToken } from '@angular/core';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { moveArticleProcess } from './move.process';
import { ArticleId } from '../../model/article-id';
import { DriveApiService } from '../../../services/drive-api';
import { getArticleContentProcess } from './get-content';
import { CheckAuthBL, ParseArticleIdBL } from '../../process-bl';
import { VaultStore } from '../../store/vault/vault.store';
import { CacheStore } from '../../store/cache/cache.store';
import { VaultStateStore } from '../../store/vault-state/vault-state.store';
import { ParseArticleLogic } from '../../process-bl/parse-article';

export type MoveArticleProcess = (from: ArticleId, to: ArticleId) => void;
export const MoveArticleProcess = new InjectionToken<MoveArticleProcess>('MoveArticleProcess', {
  providedIn: 'root',
  factory: () => {
    const vault = inject(VaultStore);
    const vaultState = inject(VaultStateStore);
    const cache = inject(CacheStore);

    const exerciseStore = inject(ExerciseStore);
    const parseArticleId = inject(ParseArticleIdBL);

    return moveArticleProcess({ vault, vaultState, cache, exerciseStore, parseArticleId });
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

      const vault = inject(VaultStore);
      const vaultState = inject(VaultStateStore);
      const cache = inject(CacheStore);
      const parseArticle = inject(ParseArticleLogic);

      return getArticleContentProcess({
        driveApi,
        parseArticleId,
        checkAuth,
        vault,
        vaultState,
        cache,
        parseArticle,
      });
    },
  },
);
