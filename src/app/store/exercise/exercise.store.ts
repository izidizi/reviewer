import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ExerciseSlice, initialExerciseSlice } from './exercise.slice';
import * as updaters from './exercise.updaters';
import { computed } from '@angular/core';

export type ExerciseStore = InstanceType<typeof ExerciseStore>;

export const ExerciseStore = signalStore(
  { providedIn: 'root' },
  withState(initialExerciseSlice),
  withComputed((store) => ({
    configuration: computed(() => ({
      includeTags: store.includeTags(),
      includeTopics: store.includeTopics(),
      excludeTags: store.excludeTags(),
      excludeTopics: store.excludeTopics(),
      newArticlesPerDay: store.newArticlesPerDay(),
      repeatTimes: store.repeatTimes(),
    })),
  })),
  withMethods((store) => {
    return {
      setInitialConfiguration: (data: updaters.SetInitialConfigurationData) =>
        patchState(store, updaters.setInitialConfiguration(data)),
      setTodayConfiguration: (data: updaters.SetTodayConfigurationData) =>
        patchState(store, updaters.setTodayConfiguration(data)),

      patchStartDate: (startDate: ExerciseSlice['startDate']) =>
        patchState(store, updaters.patchStartDate(startDate)),
    };
  }),
);
