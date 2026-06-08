import { PartialStateUpdater } from '@ngrx/signals';
import { ConfigurationSlice } from './configuration.slice';
import { Path } from '../../model/path';

export const setInitialConfiguration: (
  vaultRootPath: Path,
  vaultConfigurationName: string,
) => PartialStateUpdater<ConfigurationSlice> = (vaultRootPath, vaultConfigurationName) => {
  return () => ({
    vaultRootPath,
    vaultConfigurationName,
  });
};

export type LoadConfigurationData = Pick<
  ConfigurationSlice,
  'vaultRootPath' | 'vaultRootPathDriveId' | 'vaultConfigurationName' | 'vaultConfigurationDriveId'
>;
export const loadConfiguration: (
  data: LoadConfigurationData,
) => PartialStateUpdater<ConfigurationSlice> = ({
  vaultRootPath,
  vaultRootPathDriveId,
  vaultConfigurationName,
  vaultConfigurationDriveId,
}) => {
  return () => ({
    vaultRootPath,
    vaultRootPathDriveId,
    vaultConfigurationName,
    vaultConfigurationDriveId,
    isLoaded: true,
  });
};

export type SetVaultConfigurationData = Pick<ConfigurationSlice, 'path'>;
export const setVaultConfiguration: (
  data: SetVaultConfigurationData,
) => PartialStateUpdater<ConfigurationSlice> = ({ path }) => {
  return () => ({
    path,
    isUpdated: false,
  });
};

export type PathVaultConfigurationData = Pick<ConfigurationSlice, 'path'>;
export const pathVaultConfiguration: (
  data: PathVaultConfigurationData,
) => PartialStateUpdater<ConfigurationSlice> = ({ path }) => {
  return () => ({
    path,
    isUpdated: true,
  });
};

export const resetIsUpdated: () => PartialStateUpdater<ConfigurationSlice> = () => {
  return () => ({
    isUpdated: false,
  });
};

export const patchPath: (path: Path) => PartialStateUpdater<ConfigurationSlice> = (path) => {
  return () => ({
    path,
    isUpdated: true,
  });
};
