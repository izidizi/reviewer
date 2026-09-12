import { PartialStateUpdater } from '@ngrx/signals';
import { PlanSlice } from './plan.slice';
import { ArticleId } from '../../model/article-id';

export type PatchPlanData = Pick<PlanSlice, 'newList' | 'repeatList'>;
export const patchPlan: (data: PatchPlanData) => PartialStateUpdater<PlanSlice> =
  ({ newList, repeatList }) =>
  () => ({ newList, repeatList });

export type PatchConsolidatePlanData = Pick<PlanSlice, 'consolidateList'>;
export const patchConsolidatePlan: (
  data: PatchConsolidatePlanData,
) => PartialStateUpdater<PlanSlice> =
  ({ consolidateList }) =>
  () => ({ consolidateList });

export type RemoveArticleData = { articleId: ArticleId };
export const removeArticle: (data: RemoveArticleData) => PartialStateUpdater<PlanSlice> =
  ({ articleId }) =>
  ({ newList, repeatList, consolidateList }) => ({
    newList: newList.filter((listArticleId) => listArticleId !== articleId),
    repeatList: repeatList.filter((listArticleId) => listArticleId !== articleId),
    consolidateList: consolidateList.filter((listArticleId) => listArticleId !== articleId),
  });
