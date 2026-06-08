import { inject, InjectionToken } from '@angular/core';
import { DriveApiService } from '../../../services/drive-api/drive-api.service';
import { LogoutProcess } from '../logout.process';
import { CheckAuthProcess } from '../check-auth.process';
import { Path } from '../../model/path';
import { ProcessError } from '../../../model/error/process-error';
import { ConfigurationStore } from '../../store/configuration/configuration.store';
import { ArticleService } from '../../../services/article/article.service';
import { VaultIndexStore } from '../../store/vault-index/vault-index.store';
import { vaultIndexAllProcess } from './index-all.process';
import { valutlIndexMissingProcess } from './index-missing.process';
import { DriveId } from '../../model/drive-id';
import { getDirectoryDriveId } from './get-directory-id.process';
import { DecisionTableService } from '../../../services/decision-table.service';
import { ArticleId } from '../../model/article-id';
import { vaultIndexArticleProcess } from './index-article.process';
import { CheckAuthBL, ParseArticleIdBL } from '../../process-bl';

export class RootPathNotFound extends ProcessError {
  constructor(path: Path) {
    super({ process: 'IndexVaultProcess', message: `root path ${path.join('/')} not found` });
  }
}

export type VaultIndexAllProcess = () => Promise<void>;
export const VaultIndexAllProcess = new InjectionToken<VaultIndexAllProcess>(
  'VaultIndexAllProcess',
  {
    providedIn: 'root',
    factory: () => {
      const driveApi = inject(DriveApiService);
      const articleService = inject(ArticleService);
      const configurationStore = inject(ConfigurationStore);
      const vaultIndexStore = inject(VaultIndexStore);
      const checkAuth = inject(CheckAuthBL);
      const getDirectoryDriveIdProcess = inject(GetDirectoryDriveIdProcess);

      return vaultIndexAllProcess({
        driveApi,
        articleService,
        configurationStore,
        vaultIndexStore,
        checkAuth,
        getDirectoryDriveIdProcess,
      });
    },
  },
);

export type VaultIndexMissingProcess = (config: {
  reindexArticlesWithInvalidIndexDate: boolean;
  reindexArticlesOlderThan?: Date;
}) => Promise<void>;
export const VaultIndexMissingProcess = new InjectionToken<VaultIndexMissingProcess>(
  'VaultIndexMissingProcess',
  {
    providedIn: 'root',
    factory: () => {
      const driveApi = inject(DriveApiService);
      const decisionTable = inject(DecisionTableService);
      const articleService = inject(ArticleService);
      const configurationStore = inject(ConfigurationStore);
      const vaultIndexStore = inject(VaultIndexStore);
      const checkAuthProcess = inject(CheckAuthProcess);
      const getDirectoryDriveIdProcess = inject(GetDirectoryDriveIdProcess);

      return valutlIndexMissingProcess({
        driveApi,
        decisionService: decisionTable,
        articleService,
        configurationStore,
        vaultIndexStore,
        checkAuthProcess,
        getDirectoryDriveIdProcess,
      });
    },
  },
);

export type VaultIndexArticleProcess = (articleId: ArticleId) => Promise<void>;
export const VaultIndexArticleProcess = new InjectionToken<VaultIndexArticleProcess>(
  'VaultIndexArticleProcess',
  {
    providedIn: 'root',
    factory: () => {
      const driveApi = inject(DriveApiService);
      const articleService = inject(ArticleService);
      const vaultIndexStore = inject(VaultIndexStore);
      const checkAuth = inject(CheckAuthBL);
      const parseArticleId = inject(ParseArticleIdBL);
      const getDirectoryDriveIdProcess = inject(GetDirectoryDriveIdProcess);

      return vaultIndexArticleProcess({
        driveApi,
        articleService,
        vaultIndexStore,
        checkAuth,
        getDirectoryDriveIdProcess,
        parseArticleId,
      });
    },
  },
);

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
