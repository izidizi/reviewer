import { PartialStateUpdater } from '@ngrx/signals';
import { PlanSlice } from './plan.slice';

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
