import { PartialStateUpdater } from '@ngrx/signals';
import { ConfigurationSlice } from './configuration.slice';
import { Path } from '../../model/path';

export const setInitialConfiguration: (
  configurationPath: Path,
  configurationName: string,
) => PartialStateUpdater<ConfigurationSlice> = (configurationPath, configurationName) => {
  return () => ({
    configurationPath,
    configurationName,
  });
};

export const setConfiguration: (
  payload: Pick<
    ConfigurationSlice,
    'path' | 'configurationPathDriveId' | 'configurationNameDriveId'
  >,
) => PartialStateUpdater<ConfigurationSlice> = ({
  path,
  configurationPathDriveId,
  configurationNameDriveId,
}) => {
  return () => ({
    configurationPathDriveId,
    configurationNameDriveId,
    isLoaded: true,
    path,
  });
};
