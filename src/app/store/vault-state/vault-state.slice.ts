import { ReviewStorage } from '../../../model/storage/review';
import { ArticleId } from '../../model/article-id';

export interface VaultStateSlice {
  hasChanges: boolean;
  reviewsQueueId: number;
  reviewsQueue: { reviewsQueueId: number; articleId: ArticleId; review: ReviewStorage }[];
  reviewsDeadQueue: { reviewsQueueId: number; articleId: ArticleId; review: ReviewStorage }[];
}

export const initialVaultStateSlice: VaultStateSlice = {
  hasChanges: false,
  reviewsQueueId: 0,
  reviewsQueue: [],
  reviewsDeadQueue: [],
};
