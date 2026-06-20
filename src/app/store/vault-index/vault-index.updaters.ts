import { PartialStateUpdater } from '@ngrx/signals';
import { VaultIndexSlice } from './vault-index.slice';
import { VaultArticle } from '../../model/vault-article';
import { ArticleId } from '../../model/article-id';
import { AppError } from '../../../model/error/app-error';

export const setArticles: (
  articles: VaultIndexSlice['articles'],
) => PartialStateUpdater<VaultIndexSlice> = (articles) => {
  return () => ({
    isUpdated: false,
    articles,
  });
};

export const indexArticle: (article: VaultArticle) => PartialStateUpdater<VaultIndexSlice> = (
  article,
) => {
  return ({ articles }) => ({
    isUpdated: true,
    articles: {
      ...articles,
      [article.articleId]: article,
    },
  });
};

export const deleteArticle: (articleId: ArticleId) => PartialStateUpdater<VaultIndexSlice> = (
  articleId,
) => {
  return ({ articles }) => ({
    isUpdated: true,
    articles: {
      ...articles,
      [articleId]: undefined,
    },
  });
};

export const resetIsUpdated: () => PartialStateUpdater<VaultIndexSlice> = () => {
  return () => ({
    isUpdated: false,
  });
};

export type StartVaultIndexData = {
  mode: VaultIndexSlice['vaultIndexProcess']['mode'];
  started: Date;
};
export const startVaultIndex: (
  data: StartVaultIndexData,
) => PartialStateUpdater<VaultIndexSlice> = ({ mode, started }) => {
  return () => ({
    vaultIndexProcess: {
      mode,
      statistics: {
        started,
        lastIndexed: null,
        totalIndexed: 0,
      },
      result: null,
    },
  });
};

export type UpdateVaultIndexData = {
  lastIndexed: ArticleId;
  totalIndexed: number;
};
export const updateVaultIndex: (
  data: UpdateVaultIndexData,
) => PartialStateUpdater<VaultIndexSlice> = ({ lastIndexed, totalIndexed }) => {
  return (state) => {
    const statistics = state.vaultIndexProcess.statistics;
    if (statistics === null) throw new AppError(`updateIndex is used before startIndex`);

    return {
      vaultIndexProcess: {
        ...state.vaultIndexProcess,
        statistics: {
          ...statistics,
          lastIndexed,
          totalIndexed,
        },
      },
    };
  };
};

export type FinishVaultIndexData = {
  totalIndexed: number;
  status: NonNullable<VaultIndexSlice['vaultIndexProcess']['result']>['status'];
  finished: Date;
  error?: Error;
};
export const finishVaultIndex: (
  data: FinishVaultIndexData,
) => PartialStateUpdater<VaultIndexSlice> = ({ totalIndexed, status, finished, error }) => {
  return (state) => {
    const statistics = state.vaultIndexProcess.statistics;
    if (statistics === null) throw new AppError(`finishIndex is used before startIndex`);

    return {
      vaultIndexProcess: {
        ...state.vaultIndexProcess,
        statistics: {
          ...statistics,
          totalIndexed,
        },
        result: {
          status,
          finished,
          error,
        },
      },
    };
  };
};
