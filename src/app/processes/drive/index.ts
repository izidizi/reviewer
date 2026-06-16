import { inject, InjectionToken } from '@angular/core';
import { DriveApiService } from '../../../services/drive-api/drive-api.service';
import { CheckAuthProcess } from '../check-auth.process';
import { Path } from '../../model/path';
import { ConfigurationStore } from '../../store/configuration/configuration.store';
import { ArticleService } from '../../../services/article/article.service';
import { VaultIndexStore } from '../../store/vault-index/vault-index.store';
import { DriveId } from '../../model/drive-id';
import { DecisionTableService } from '../../../services/decision-table.service';
import { ArticleId } from '../../model/article-id';
import { CheckAuthBL, ParseArticleIdBL } from '../../process-bl';
import { getDirectoryDriveId } from './get-directory-id.process';
import { getFileDriveIdProcess } from './get-file-id.process';
import { VaultFile } from '../../model/vault-file';

export type GetDirectoryDriveIdProcess = (accessToken: string, path: Path) => Promise<DriveId>;
export const GetDirectoryDriveIdProcess = new InjectionToken<GetDirectoryDriveIdProcess>(
  'GetDirectoryDriveIdProcess',
  {
    providedIn: 'root',
    factory: () => {
      const driveApi = inject(DriveApiService);
      const configurationStore = inject(ConfigurationStore);

      return getDirectoryDriveId({
        driveApi,
        configurationStore,
      });
    },
  },
);

export type GetFileDriveIdProcess = (
  accessToken: string,
  path: Path,
  file: VaultFile,
) => Promise<{ directoryDriveId: DriveId; fileDriveId: DriveId }>;
export const GetFileDriveIdProcess = new InjectionToken<GetFileDriveIdProcess>(
  'GetFileDriveIdProcess',
  {
    providedIn: 'root',
    factory: () => {
      const driveApi = inject(DriveApiService);
      const getDirectoryDriveIdProcess = inject(GetDirectoryDriveIdProcess);

      return getFileDriveIdProcess({
        driveApi,
        getDirectoryDriveIdProcess,
      });
    },
  },
);
