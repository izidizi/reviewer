import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export interface FeaturePlanSlice {
  scroll: [number, number];
}

export const initialFeaturePlanSlice: FeaturePlanSlice = {
  scroll: [0, 0],
};

export type FeaturePlanStore = InstanceType<typeof FeaturePlanStore>;

export const FeaturePlanStore = signalStore(
  { providedIn: 'root' },
  withState(initialFeaturePlanSlice),
  withMethods((store) => {
    return {
      patchScroll: (scroll: [number, number]) => patchState(store, () => ({ scroll })),
    };
  }),
);
