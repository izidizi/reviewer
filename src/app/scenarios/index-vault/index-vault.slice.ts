import { ArticleId } from '../../model/article-id';

export interface IndexVaultSlice {
  mode: null | 'new' | 'all';
  statistics: {
    started: Date;
    lastIndexed: ArticleId | null;
    totalIndexed: number;
  } | null;
  result: {
    status: 'ok' | 'error';
    finished: Date;
    error?: Error;
  } | null;
}

export const initialIndexVaultSlice: IndexVaultSlice = {
  mode: null,
  statistics: null,
  result: null,
};
