import { inject, InjectionToken } from '@angular/core';
import { FeatureIndexStore } from './index.store';

export type RenderRecordsLogic = () => void;
export const RenderRecordsLogic = new InjectionToken<RenderRecordsLogic>('RenderRecordsLogic', {
  factory: () => {
    const featureIndexStore = inject(FeatureIndexStore);

    return () => {
      featureIndexStore.setRenderRecordsAnyway(true);
    };
  },
});
