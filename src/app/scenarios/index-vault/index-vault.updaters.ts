import { PartialStateUpdater } from '@ngrx/signals';
import { IndexVaultSlice } from './index-vault.slice';
import { ArticleId } from '../../model/article-id';
import { AppError } from '../../../model/error/app-error';

export type StartData = {
  mode: IndexVaultSlice['mode'];
  started: Date;
};
export const start: (data: StartData) => PartialStateUpdater<IndexVaultSlice> = ({
  mode,
  started,
}) => {
  return () => ({
    mode,
    statistics: {
      started,
      lastIndexed: null,
      totalIndexed: 0,
    },
    result: null,
  });
};

export type UpdateData = {
  lastIndexed: ArticleId;
  totalIndexed: number;
};
export const update: (data: UpdateData) => PartialStateUpdater<IndexVaultSlice> = ({
  lastIndexed,
  totalIndexed,
}) => {
  return (state) => ({
    statistics: {
      started: state.statistics?.started ?? new Date(),
      lastIndexed,
      totalIndexed,
    },
  });
};

export type FinishData = {
  totalIndexed: number;
  status: NonNullable<IndexVaultSlice['result']>['status'];
  finished: Date;
  error?: Error;
};
export const finish: (data: FinishData) => PartialStateUpdater<IndexVaultSlice> = ({
  totalIndexed,
  status,
  finished,
  error,
}) => {
  return (state) => ({
    statistics: {
      ...(state.statistics ?? { started: new Date(), lastIndexed: null, totalIndexed }),
      totalIndexed,
    },
    result: {
      status,
      finished,
      error,
    },
  });
};
