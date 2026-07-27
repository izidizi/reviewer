import { inject, InjectionToken } from '@angular/core';
import { FeatureIndexStore } from './index.store';

export type IndexFilterLogic = (filter: string | null) => void;
export const IndexFilterLogic = new InjectionToken<IndexFilterLogic>('IndexFilterLogic', {
  factory: () => {
    const featureIndexStore = inject(FeatureIndexStore);

    return (filter) => {
      const renderMode = featureIndexStore.renderMode();

      featureIndexStore.setFilter(filter ?? '');
      featureIndexStore.setRenderRecordsAnyway(false);

      if (renderMode === 'filter' && filter === null) {
        featureIndexStore.setRenderMode('stat');
      } else if (renderMode === 'stat' && (filter?.length ?? 0) >= 3) {
        featureIndexStore.setRenderMode('filter');
      } else if (renderMode === 'filter') {
        return;
      }
    };
  },
});
