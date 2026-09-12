import { inject, InjectionToken } from '@angular/core';
import { DriveApiService } from '../../../services/drive-api/drive-api.service';
import { ConfigurationStore } from '../../store/configuration/configuration.store';
import { DecisionTableService } from '../../../services/decision-table.service';
import { ArticleId } from '../../model/article-id';
import { VaultStore } from '../../store/vault/vault.store';
import { VaultStateStore } from '../../store/vault-state/vault-state.store';
import { GetDirectoryDriveIdProcess } from '../../processes/drive';
import { indexVaultMissingProcess } from './index-vault-missing.process';
import { indexVaultScenario } from './index-vault.scenario';
import { CheckAuthBL } from '../../process-bl';
import { IndexVaultStore } from './index-vault.store';
import { ParseArticleLogic } from '../../process-bl/parse-article';
import { indexVaultAllScenario } from './index-vault-all.scenario';

export type IndexVaultScenario = (config: {
  mode: 'missing' | 'all' | ArticleId;
  reindexArticlesWithInvalidIndexDate: boolean;
  reindexArticlesOlderThan?: Date;
}) => Promise<void>;
export const IndexVaultScenario = new InjectionToken<IndexVaultScenario>('IndexVaultScenario', {
  providedIn: 'root',
  factory: () => {
    const indexVaultMissingProcess = inject(IndexVaultMissingProcess);
    const indexVaultAllScenario = inject(IndexVaultAllScenario);

    return indexVaultScenario({
      indexVaultMissingProcess,
      indexVaultAllScenario,
    });
  },
});

export type IndexVaultMissingProcess = (config: {
  reindexArticlesWithInvalidIndexDate: boolean;
  reindexArticlesOlderThan?: Date;
}) => Promise<void>;
export const IndexVaultMissingProcess = new InjectionToken<IndexVaultMissingProcess>(
  'IndexVaultMissingProcess',
  {
    providedIn: 'root',
    factory: () => {
      const driveApi = inject(DriveApiService);
      const decisionService = inject(DecisionTableService);
      const indexVaultStore = inject(IndexVaultStore);
      const configurationStore = inject(ConfigurationStore);
      const vaultStore = inject(VaultStore);
      const vaultStateStore = inject(VaultStateStore);
      const checkAuthLogic = inject(CheckAuthBL);
      const getDirectoryDriveIdProcess = inject(GetDirectoryDriveIdProcess);
      const parseArticleLogic = inject(ParseArticleLogic);

      return indexVaultMissingProcess({
        driveApi,
        decisionService,
        indexVaultStore,
        configurationStore,
        vaultStore,
        vaultStateStore,
        checkAuthLogic,
        getDirectoryDriveIdProcess,
        parseArticleLogic,
      });
    },
  },
);

export type IndexVaultAllScenario = (config: {}) => Promise<void>;
export const IndexVaultAllScenario = new InjectionToken<IndexVaultAllScenario>(
  'IndexVaultAllProcess',
  {
    providedIn: 'root',
    factory: () => {
      const driveApi = inject(DriveApiService);
      const decisionService = inject(DecisionTableService);
      const indexVaultStore = inject(IndexVaultStore);
      const configurationStore = inject(ConfigurationStore);
      const vaultStore = inject(VaultStore);
      const vaultStateStore = inject(VaultStateStore);
      const checkAuthLogic = inject(CheckAuthBL);
      const getDirectoryDriveIdProcess = inject(GetDirectoryDriveIdProcess);
      const parseArticleLogic = inject(ParseArticleLogic);

      return indexVaultAllScenario({
        driveApi,
        decisionService,
        indexVaultStore,
        configurationStore,
        vaultStore,
        vaultStateStore,
        checkAuthLogic,
        getDirectoryDriveIdProcess,
        parseArticleLogic,
      });
    },
  },
);
