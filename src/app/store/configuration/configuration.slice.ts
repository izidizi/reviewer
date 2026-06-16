import { DriveId } from '../../model/drive-id';
import { Path } from '../../model/path';

export interface ConfigurationSlice {
  vaultRootPath: Path;
  vaultRootPathDriveId: DriveId | null;
  vaultConfigurationName: string | null;
  isLoaded: boolean;
  isUpdated: boolean;
  path: Path;
}

export const initialConfigurationSlice: ConfigurationSlice = {
  vaultRootPath: [],
  vaultRootPathDriveId: null,
  vaultConfigurationName: null,
  isUpdated: false,
  isLoaded: false,
  path: [],
};
