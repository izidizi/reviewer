import { inject, InjectionToken } from '@angular/core';
import { DriveApiService } from '../../services/drive-api/drive-api.service';
import { LogoutProcess } from './logout.process';
import { DriveApiAuthenticationError } from '../../services/drive-api/drive-api-errors';
import { CheckAuthProcess } from './check-auth.process';
import { parsePath, Path } from '../model/path';
import { ProcessError, ProcessUnhandledError } from '../../model/error/process-error';
import { ZipService } from '../../services/zip/zip.service';
import { ConfigurationStore } from '../store/configuration/configuration.store';
import { VaultConfigurationStorage } from '../../model/storage/configuration';
import { VaultIndexStore } from '../store/vault-index/vault-index.store';
import { VaultIndexStorage } from '../../model/storage/vault-index';
import { VaultIndexSlice } from '../store/vault-index/vault-index.slice';
import { ArticleId, getArticleId } from '../model/article-id';
import { getDriveId } from '../model/drive-id';
import { ResultsService } from '../../services/results/results.service';
import { ReviewStorage } from '../../model/storage/review';
import { StatisticsStore } from '../store/statistics/statistics.store';
import { ExerciseSlice, initialExerciseSlice } from '../store/exercise/exercise.slice';
import { ExerciseStore } from '../store/exercise/exercise.store';

export class RootPathNotDefined extends ProcessError {
  constructor() {
    super({
      process: 'LoadConfigurationProcess',
      message: `root path not defined`,
    });
  }
}

export class RootPathNotFound extends ProcessError {
  constructor(path: Path) {
    super({
      process: 'LoadConfigurationProcess',
      message: `root path ${path.join('/')} not found`,
    });
  }
}

export class ConfigurationNotFound extends ProcessError {
  constructor(path: Path, fileName: string) {
    super({
      process: 'LoadConfigurationProcess',
      message: `root path ${path.join('/')} doesn't contain configuration file '${fileName}'`,
    });
  }
}

export type LoadConfigurationProcess = (path: Path, fileName: string) => Promise<void>;
export const LoadConfigurationProcess = new InjectionToken<LoadConfigurationProcess>(
  'LoadConfigurationProcess',
  {
    providedIn: 'root',
    factory: () => {
      const zipService = inject(ZipService);
      const driveApi = inject(DriveApiService);
      const resultsService = inject(ResultsService);
      const configurationStore = inject(ConfigurationStore);
      const vaultIndexStore = inject(VaultIndexStore);
      const statisticsStore = inject(StatisticsStore);
      const exerciseStore = inject(ExerciseStore);
      const logoutProcess = inject(LogoutProcess);
      const checkAuthProcess = inject(CheckAuthProcess);

      return loadConfigurationProcess({
        zipService,
        driveApi,
        resultsService,
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

function loadConfigurationProcess({
  zipService,
  driveApi,
  resultsService,
  configurationStore,
  statisticsStore,
  vaultIndexStore,
  exerciseStore,
  logoutProcess,
  checkAuthProcess,
}: {
  zipService: ZipService;
  driveApi: DriveApiService;
  resultsService: ResultsService;
  configurationStore: ConfigurationStore;
  vaultIndexStore: VaultIndexStore;
  statisticsStore: StatisticsStore;
  exerciseStore: ExerciseStore;
  logoutProcess: LogoutProcess;
  checkAuthProcess: CheckAuthProcess;
}): LoadConfigurationProcess {
  return async () => {
    const accessToken = await checkAuthProcess();

    if (configurationStore.isLoaded()) return;
    const path = configurationStore.configurationPath();
    const fileName = configurationStore.configurationName();
    if (path.length === 0 || !fileName) {
      throw new RootPathNotDefined();
    }

    let rootId: string | null = null;

    try {
      for (const pathItem of path) {
        const { files } = await driveApi.listFiles(accessToken, rootId ?? 'root');
        rootId =
          files.find(
            ({ mimeType, name }) =>
              mimeType === 'application/vnd.google-apps.folder' && name === pathItem,
          )?.id ?? null;
        if (rootId === null) {
          throw new RootPathNotFound(path);
        }
      }

      const { files } = await driveApi.listFiles(accessToken, rootId!);
      const configurationFile = files.find(
        ({ mimeType, name }) => mimeType === 'application/zip' && name === fileName,
      );

      if (!configurationFile) {
        throw new ConfigurationNotFound(path, fileName);
      }

      const configurationStream = await driveApi.getBinaryFileContent(
        accessToken,
        configurationFile.id,
      );
      const configurationMap = await zipService.extractAllJSON(configurationStream);

      // configuration
      const configurationStorage = configurationMap[
        'configuration.json'
      ] as VaultConfigurationStorage;
      configurationStore.setConfiguration({
        path: parsePath(configurationStorage.path),
        configurationPathDriveId: getDriveId(rootId!),
        configurationNameDriveId: getDriveId(configurationFile.id),
      });

      // index
      const vaultIndexStorage = configurationMap['index.json'] as VaultIndexStorage;
      const articles: VaultIndexSlice['articles'] = {};
      vaultIndexStorage.articles.forEach(
        ({ driveId, path, name, topics: links, tags, indexed }) => {
          const articleId: ArticleId = getArticleId(path, name);
          articles[articleId] = {
            driveId: getDriveId(driveId),
            articleId,
            path: parsePath(path),
            name,
            tags,
            topics: links,
            indexed: new Date(indexed),
            content: null,
          };
        },
      );
      vaultIndexStore.setArticles(articles);

      const exerciseConfiguration: ExerciseSlice = initialExerciseSlice;
      exerciseConfiguration.startDate = new Date(vaultIndexStorage.exerciseConfiguration.startDate);
      exerciseConfiguration.includeTags = vaultIndexStorage.exerciseConfiguration.includeTags;
      exerciseConfiguration.includeTopics = vaultIndexStorage.exerciseConfiguration.includeTopics;
      exerciseConfiguration.excludeTags = vaultIndexStorage.exerciseConfiguration.excludeTags;
      exerciseConfiguration.excludeTopics = vaultIndexStorage.exerciseConfiguration.excludeTopics;
      exerciseConfiguration.repeatTimes = vaultIndexStorage.exerciseConfiguration.repeatTimes;
      exerciseConfiguration.newArticlesPerDay =
        vaultIndexStorage.exerciseConfiguration.newArticlesPerDay;
      exerciseStore.setInitialConfiguration(exerciseConfiguration);

      // reviews
      processReviews(configurationMap['results.json'] as ReviewStorage[], {
        exerciseConfiguration,
        resultsService,
        statisticsStore,
      });
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

function processReviews(
  reviews: ReviewStorage[],
  {
    statisticsStore,
    resultsService,
    exerciseConfiguration,
  }: {
    statisticsStore: StatisticsStore;
    resultsService: ResultsService;
    exerciseConfiguration: ExerciseSlice;
  },
) {
  statisticsStore.setReviews(reviews);
  const { articles, excersises, days } = resultsService.processResults(
    reviews,
    exerciseConfiguration,
  );
  statisticsStore.setArticleStatistics(articles);
  statisticsStore.setExerciseStatistics(excersises);
  statisticsStore.setDayStatistics(days);
}
