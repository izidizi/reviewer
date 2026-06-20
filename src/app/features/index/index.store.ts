import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ArticleId } from '../../model/article-id';

export interface FeatureIndexSlice {
  filter: string;
  scroll: [number, number];
  expandedArticleId: ArticleId | null;
}

export const initialFeatureIndexSlice: FeatureIndexSlice = {
  filter: '',
  scroll: [0, 0],
  expandedArticleId: null,
};

export type FeatureIndexStore = InstanceType<typeof FeatureIndexStore>;

export const FeatureIndexStore = signalStore(
  { providedIn: 'root' },
  withState(initialFeatureIndexSlice),
  withMethods((store) => {
    return {
      setFilter: (filter: string) => patchState(store, () => ({ filter })),
      setScroll: (scroll: [number, number]) => patchState(store, () => ({ scroll })),
      setExpanded: (articleId: ArticleId | null) =>
        patchState(store, () => ({ expandedArticleId: articleId })),
    };
  }),
);
