import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export interface FeatureConsolidateSlice {
  scroll: [number, number];
}

export const initialFeatureConsolidateSlice: FeatureConsolidateSlice = {
  scroll: [0, 0],
};

export type FeatureConsolidateStore = InstanceType<typeof FeatureConsolidateStore>;

export const FeatureConsolidateStore = signalStore(
  { providedIn: 'root' },
  withState(initialFeatureConsolidateSlice),
  withMethods((store) => {
    return {
      patchScroll: (scroll: [number, number]) => patchState(store, () => ({ scroll })),
    };
  }),
);
