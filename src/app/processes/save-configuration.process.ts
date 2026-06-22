import { inject, InjectionToken } from '@angular/core';
import { DriveApiService } from '../../services/drive-api/drive-api.service';
import { LogoutProcess } from './logout.process';
import { DriveApiAuthenticationError } from '../../services/drive-api/drive-api-errors';
import { CheckAuthProcess } from './check-auth.process';
import { ProcessError, ProcessUnhandledError } from '../../model/error/process-error';
import { ZipService } from '../../services/zip/zip.service';
import { ConfigurationStore } from '../store/configuration/configuration.store';
import { VaultConfigurationStorage } from '../../model/storage/configuration';
import {
  VaultIndexExerciseConfiguration,
  VaultIndexArticleStorage,
  VaultIndexStorage,
} from '../../model/storage/vault-index';
import { StatisticsStore } from '../store/statistics/statistics.store';
import { ExerciseStore } from '../store/exercise/exercise.store';
import { dateToISO80601String } from '../../model/utils';
import { file } from 'jszip';
import { GetFileDriveIdProcess } from './drive';
import { assertValidVaultFile } from '../model/vault-file';
import { VaultStore } from '../store/vault/vault.store';
import { VaultStateStore } from '../store/vault-state/vault-state.store';
import { ReviewStorage } from '../../model/storage/review';
import { ArticleId } from '../model/article-id';

export class NoConfigurationError extends ProcessError {
  constructor() {
    super({
      process: 'SaveConfigufationProcess',
      message: `no configuration`,
    });
  }
}

export class ConfigurationIsReadonlyError extends ProcessError {
  constructor() {
    super({
      process: 'SaveConfigufationProcess',
      message: `configuration is readonly`,
    });
  }
}

export type SaveConfigufationProcess = () => Promise<void>;
export const SaveConfigufationProcess = new InjectionToken<SaveConfigufationProcess>(
  'SaveConfigufationProcess',
  {
    providedIn: 'root',
    factory: () => {
      const zipService = inject(ZipService);
      const driveApi = inject(DriveApiService);
      const configurationStore = inject(ConfigurationStore);
      const vaultStore = inject(VaultStore);
      const vaultStateStore = inject(VaultStateStore);
      const statisticsStore = inject(StatisticsStore);
      const exerciseStore = inject(ExerciseStore);
      const logoutProcess = inject(LogoutProcess);
      const checkAuthProcess = inject(CheckAuthProcess);
      const getFileDriveId = inject(GetFileDriveIdProcess);

      return saveConfigurationProcess({
        zipService,
        driveApi,
        configurationStore,
        vaultStore,
        vaultStateStore,
        statisticsStore,
        exerciseStore,
        logoutProcess,
        checkAuthProcess,
        getFileDriveId,
      });
    },
  },
);

function saveConfigurationProcess({
  zipService,
  driveApi,
  configurationStore,
  vaultStore,
  vaultStateStore,
  exerciseStore,
  logoutProcess,
  checkAuthProcess,
  getFileDriveId,
}: {
  zipService: ZipService;
  driveApi: DriveApiService;
  configurationStore: ConfigurationStore;
  vaultStore: VaultStore;
  vaultStateStore: VaultStateStore;
  statisticsStore: StatisticsStore;
  exerciseStore: ExerciseStore;
  logoutProcess: LogoutProcess;
  checkAuthProcess: CheckAuthProcess;
  getFileDriveId: GetFileDriveIdProcess;
}): SaveConfigufationProcess {
  return async () => {
    const accessToken = await checkAuthProcess();

    if (configurationStore.isLoaded() === false) {
      throw new NoConfigurationError();
    }

    const configurationFileName = configurationStore.vaultConfigurationName();
    const pathDriveId = configurationStore.vaultRootPathDriveId();
    if (!configurationFileName || pathDriveId === null) {
      throw new NoConfigurationError();
    }
    assertValidVaultFile(configurationFileName);

    const { fileDriveId } = await getFileDriveId(accessToken, [], configurationFileName);
    console.log('fileDriveId', fileDriveId);

    try {
      const capabilities = await driveApi.getFileCapabilities(accessToken, fileDriveId);
      if (capabilities.canDelete === false) {
        throw new ConfigurationIsReadonlyError();
      }

      await driveApi.deleteFile(accessToken, fileDriveId);

      const configurationStorage: VaultConfigurationStorage = {
        path: configurationStore.path().join('/'),
      };

      const articles = vaultStore.articlesIndex();
      const exerciseConfiguration: VaultIndexExerciseConfiguration = {
        startDate: dateToISO80601String(exerciseStore.startDate()),
        includeTags: exerciseStore.includeTags(),
        includeTopics: exerciseStore.includeTopics(),
        excludeTags: exerciseStore.excludeTags(),
        excludeTopics: exerciseStore.excludeTopics(),
        newArticlesPerDay: exerciseStore.newArticlesPerDay(),
        repeatTimes: exerciseStore.repeatTimes(),
      };
      const indexStorage: VaultIndexStorage = {
        articles: Object.values(articles)
          .map((article): VaultIndexArticleStorage | null => {
            if (!article) return null;
            return {
              ...article,
            };
          })
          .filter((article) => article !== null),
        exerciseConfiguration,
      };

      const reviews = vaultStore.reviewsIndex();
      const reviewIds: ArticleId[] = Object.keys(reviews) as ArticleId[];
      const resultsStorage = reviewIds
        .map((articleId): [articleId: string, reviews: ReviewStorage[]] | null =>
          !!reviews[articleId] ? [articleId, reviews[articleId]] : null,
        )
        .filter((item): item is [articleId: string, reviews: ReviewStorage[]] => !!item)
        .reduce<ReviewStorage[]>((result, [articleId, reviews]) => [...result, ...reviews], []);

      const data = await zipService.zipFiles([
        { name: 'configuration.json', content: JSON.stringify(configurationStorage) },
        { name: 'index.json', content: JSON.stringify(indexStorage) },
        { name: 'results.json', content: JSON.stringify(resultsStorage) },
      ]);

      driveApi.uploadBlobFile(accessToken, pathDriveId, configurationFileName, data);

      vaultStateStore.setHasChanges({ hasChanges: false });
      configurationStore.resetIsUpdated();
      exerciseStore.resetIsUpdated();
    } catch (error) {
      if (error instanceof DriveApiAuthenticationError) {
        await logoutProcess();
        return;
      }
      console.warn(error);

      throw new ProcessUnhandledError({ process: 'SaveConfigufationProcess', cause: error });
    }
  };
}
