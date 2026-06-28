import { PartialStateUpdater } from '@ngrx/signals';
import { VaultStateSlice } from './vault-state.slice';

export type SetHasChangesData = Pick<VaultStateSlice, 'hasChanges'>;
export const setHasChanges: (data: SetHasChangesData) => PartialStateUpdater<VaultStateSlice> =
  ({ hasChanges }) =>
  () => ({
    hasChanges,
  });

export type SetReviewsQueueIdData = Pick<VaultStateSlice, 'reviewsQueueId'>;
export const setReviewsQueueId: (
  data: SetReviewsQueueIdData,
) => PartialStateUpdater<VaultStateSlice> =
  ({ reviewsQueueId }) =>
  (store) => ({
    reviewsQueueId,
  });

export type SetReviewQueueData = Pick<VaultStateSlice, 'reviewsQueue'>;
export const setReviewQueue: (data: SetReviewQueueData) => PartialStateUpdater<VaultStateSlice> =
  ({ reviewsQueue }) =>
  (store) => ({
    reviewsQueue,
  });
