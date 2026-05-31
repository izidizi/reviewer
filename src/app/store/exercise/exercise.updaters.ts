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
