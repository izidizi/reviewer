import { PartialStateUpdater } from '@ngrx/signals';
import { ExerciseSlice } from './exercise.slice';

export type SetInitialConfigurationData = Pick<
  ExerciseSlice,
  | 'startDate'
  | 'includeTags'
  | 'includeTopics'
  | 'excludeTags'
  | 'excludeTopics'
  | 'newArticlesPerDay'
  | 'repeatTimes'
>;
export const setInitialConfiguration: (
  data: SetInitialConfigurationData,
) => PartialStateUpdater<ExerciseSlice> = ({
  startDate,
  includeTags,
  includeTopics,
  excludeTags,
  excludeTopics,
  newArticlesPerDay,
  repeatTimes,
}) => {
  return () => ({
    startDate,
    includeTags,
    includeTopics,
    excludeTags,
    excludeTopics,
    newArticlesPerDay,
    repeatTimes,
    isUpdated: false,
  });
};

export type PatchConfiguration = Partial<
  Pick<
    ExerciseSlice,
    | 'startDate'
    | 'includeTags'
    | 'includeTopics'
    | 'excludeTags'
    | 'excludeTopics'
    | 'newArticlesPerDay'
    | 'repeatTimes'
  >
>;
export const patchConfiguration: (
  data: PatchConfiguration,
) => PartialStateUpdater<ExerciseSlice> = ({
  startDate,
  includeTags,
  includeTopics,
  excludeTags,
  excludeTopics,
  newArticlesPerDay,
  repeatTimes,
}) => {
  return (state) => ({
    startDate: startDate ?? state.startDate,
    includeTags: includeTags ?? state.includeTags,
    includeTopics: includeTopics ?? state.includeTopics,
    excludeTags: excludeTags ?? state.excludeTags,
    excludeTopics: excludeTopics ?? state.excludeTopics,
    newArticlesPerDay: newArticlesPerDay ?? state.newArticlesPerDay,
    repeatTimes: repeatTimes ?? state.repeatTimes,
    isUpdated: true,
  });
};

export type SetTodayConfigurationData = Pick<
  ExerciseSlice,
  'todayNew' | 'todayRepeat' | 'todayConsolidate'
>;
export const setTodayConfiguration: (
  data: SetTodayConfigurationData,
) => PartialStateUpdater<ExerciseSlice> = ({ todayNew, todayRepeat, todayConsolidate }) => {
  return () => ({
    todayNew,
    todayRepeat,
    todayConsolidate,
  });
};

export const patchStartDate: (
  startDate: ExerciseSlice['startDate'],
) => PartialStateUpdater<ExerciseSlice> = (startDate) => {
  return () => ({
    startDate,
  });
};

export const resetIsUpdated: () => PartialStateUpdater<ExerciseSlice> = () => {
  return () => ({
    isUpdated: false,
  });
};
