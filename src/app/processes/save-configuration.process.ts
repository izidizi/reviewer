import { inject, InjectionToken } from '@angular/core';
import { DriveApiService } from '../../services/drive-api/drive-api.service';
import { LogoutProcess } from './logout.process';
import { DriveApiAuthenticationError } from '../../services/drive-api/drive-api-errors';
import { CheckAuthProcess } from './check-auth.process';
import { ProcessError, ProcessUnhandledError } from '../../model/error/process-error';
import { ZipService } from '../../services/zip/zip.service';
import { ConfigurationStore } from '../store/configuration/configuration.store';
import { VaultConfigurationStorage } from '../../model/storage/configuration';
import { VaultIndexStore } from '../store/vault-index/vault-index.store';
import {
  ValudIndexExerciseConfiguration,
  VaultIndexArticleStorage,
  VaultIndexStorage,
} from '../../model/storage/vault-index';
import { StatisticsStore } from '../store/statistics/statistics.store';
import { ExerciseStore } from '../store/exercise/exercise.store';
import { dateToISO80601String } from '../../model/utils';

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
      const vaultIndexStore = inject(VaultIndexStore);
      const statisticsStore = inject(StatisticsStore);
      const exerciseStore = inject(ExerciseStore);
      const logoutProcess = inject(LogoutProcess);
      const checkAuthProcess = inject(CheckAuthProcess);

      return saveConfigurationProcess({
        zipService,
        driveApi,
        configurationStore,
        vaultIndexStore,
        statisticsStore,
        exerciseStore,
        logoutProcess,
        checkAuthProcess,
      });
    },
  },
);

function saveConfigurationProcess({
  zipService,
  driveApi,
  configurationStore,
  statisticsStore,
  vaultIndexStore,
  exerciseStore,
  logoutProcess,
  checkAuthProcess,
}: {
  zipService: ZipService;
  driveApi: DriveApiService;
  configurationStore: ConfigurationStore;
  vaultIndexStore: VaultIndexStore;
  statisticsStore: StatisticsStore;
  exerciseStore: ExerciseStore;
  logoutProcess: LogoutProcess;
  checkAuthProcess: CheckAuthProcess;
}): SaveConfigufationProcess {
  return async () => {
    const accessToken = await checkAuthProcess();

    if (configurationStore.isLoaded() === false) {
      throw new NoConfigurationError();
    }

    const configurationFileName = configurationStore.configurationName();
    const pathDriveId = configurationStore.configurationPathDriveId();
    const fileDriveId = configurationStore.configurationNameDriveId();
    if (!configurationFileName || pathDriveId === null || fileDriveId === null) {
      throw new NoConfigurationError();
    }

    try {
      const capabilities = await driveApi.getFileCapabilities(accessToken, fileDriveId);
      if (capabilities.canDelete === false) {
        throw new ConfigurationIsReadonlyError();
      }

      await driveApi.deleteFile(accessToken, fileDriveId);

      const configurationStorage: VaultConfigurationStorage = {
        path: configurationStore.path().join('/'),
      };

      const articles = vaultIndexStore.articles();
      const exerciseConfiguration: ValudIndexExerciseConfiguration = {
        startDate: exerciseStore.startDate().toISOString(),
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
              driveId: article.driveId,
              path: article.path.join('/'),
              name: article.name,
              topics: article.topics,
              tags: article.tags,
              indexed: dateToISO80601String(article.indexed),
            };
          })
          .filter((article) => article !== null),
        exerciseConfiguration,
      };

      const resultsStorage = statisticsStore.reviews();

      const data = await zipService.zipFiles([
        { name: 'configuration.json', content: JSON.stringify(configurationStorage) },
        { name: 'index.json', content: JSON.stringify(indexStorage) },
        { name: 'results.json', content: JSON.stringify(resultsStorage) },
      ]);

      driveApi.uploadBlobFile(accessToken, pathDriveId, configurationFileName, data);
    } catch (error) {
      if (error instanceof DriveApiAuthenticationError) {
        await logoutProcess();
        return;
      }
      console.warn(error);

      throw new ProcessUnhandledError({ process: 'LoadConfigurationProcess', cause: error });
    }
  };
}
