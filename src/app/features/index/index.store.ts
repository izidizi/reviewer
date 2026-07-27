import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ArticleId } from '../../model/article-id';

export interface FeatureIndexSlice {
  renderMode: 'filter' | 're-index' | 'stat';
  renderRecordsAnyway: boolean;
  filter: string;
  filterNoScore: boolean;
  scroll: [number, number];
  expandedArticleId: ArticleId | null;
}

export const initialFeatureIndexSlice: FeatureIndexSlice = {
  renderMode: 'stat',
  renderRecordsAnyway: false,
  filter: '',
  filterNoScore: false,
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
      setRenderMode: (renderMode: FeatureIndexSlice['renderMode']) =>
        patchState(store, () => ({ renderMode })),
      setRenderRecordsAnyway: (renderRecordsAnyway: boolean) =>
        patchState(store, () => ({ renderRecordsAnyway })),
      setFilterNoScore: (filterNoScore: boolean) => patchState(store, () => ({ filterNoScore })),
      setScroll: (scroll: [number, number]) => patchState(store, () => ({ scroll })),
      setExpanded: (articleId: ArticleId | null) =>
        patchState(store, () => ({ expandedArticleId: articleId })),
    };
  }),
);
