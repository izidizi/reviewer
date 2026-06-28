import { inject, InjectionToken } from '@angular/core';
import { ArticleId } from '../model/article-id';
import { VaultStateStore } from '../store/vault-state/vault-state.store';
import { ReviewStorage } from '../../model/storage/review';
import { dateToISO80601String } from '../../model/utils';
import { ISO8601String } from '../../model/utils/iso8601-string';

export type EnqueueReviewLogic = (
  articleId: ArticleId,
  partialReview: Pick<ReviewStorage, 'name' | 'path' | 'result'>,
) => void;
export const EnqueueReviewLogic = new InjectionToken<EnqueueReviewLogic>('EnqueueReviewLogic', {
  providedIn: 'root',
  factory: () => {
    const vaultState = inject(VaultStateStore);

    return (articleId, { name, path, result }) => {
      const reviewsQueueId = vaultState.reviewsQueueId() + 1;
      vaultState.setReviewsQueueId({ reviewsQueueId });

      const review: ReviewStorage = {
        name,
        path,
        result,
        reviewed: dateToISO80601String(new Date()) as ISO8601String,
      };
      const reviewsQueue = vaultState.reviewsQueue();
      vaultState.setHasChanges({ hasChanges: true });
      vaultState.setReviewQueue({
        reviewsQueue: [...reviewsQueue, { reviewsQueueId, articleId, review }],
      });
    };
  },
});

export type EnqueueLoadedReviewLogic = (articleId: ArticleId, review: ReviewStorage) => void;
export const EnqueueLoadedReviewLogic = new InjectionToken<EnqueueLoadedReviewLogic>(
  'EnqueueLoadedReviewLogic',
  {
    providedIn: 'root',
    factory: () => {
      const vaultState = inject(VaultStateStore);

      return (articleId, review) => {
        const reviewsQueueId = vaultState.reviewsQueueId() + 1;
        vaultState.setReviewsQueueId({ reviewsQueueId });

        const reviewsQueue = vaultState.reviewsQueue();
        vaultState.setReviewQueue({
          reviewsQueue: [...reviewsQueue, { reviewsQueueId, articleId, review }],
        });
      };
    },
  },
);
