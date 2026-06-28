import { ArticleId } from '../../model/article-id';

export interface PlanSlice {
  newList: ArticleId[];
  repeatList: ArticleId[];
  consolidateList: ArticleId[];
}

export const initialPlanSlice: PlanSlice = {
  newList: [],
  repeatList: [],
  consolidateList: [],
};
