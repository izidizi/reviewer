import { DriveId } from '../../model/drive-id';
import { Path } from '../../model/path';

export interface ConfigurationSlice {
  configurationPath: Path;
  configurationPathDriveId: DriveId | null;
  configurationName: string | null;
  configurationNameDriveId: DriveId | null;
  isLoaded: boolean;
  path: Path;
}

export const initialConfigurationSlice: ConfigurationSlice = {
  configurationPath: [],
  configurationPathDriveId: null,
  configurationName: null,
  configurationNameDriveId: null,
  isLoaded: false,
  path: [],
};
