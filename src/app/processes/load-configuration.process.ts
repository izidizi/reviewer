import { inject, InjectionToken } from '@angular/core';
import { DriveApiService } from '../../services/drive-api/drive-api.service';
import { parsePath, Path } from '../model/path';
import { ProcessError, ProcessUnhandledError } from '../../model/error/process-error';
import { ZipService } from '../../services/zip/zip.service';
import { ConfigurationStore } from '../store/configuration/configuration.store';
import { VaultConfigurationStorage } from '../../model/storage/configuration';
import { VaultIndexStorage } from '../../model/storage/vault-index';
import { ArticleId, getArticleId } from '../model/article-id';
import { getDriveId } from '../model/drive-id';
import { ReviewStorage } from '../../model/storage/review';
import { ExerciseSlice, initialExerciseSlice } from '../store/exercise/exercise.slice';
import { ExerciseStore } from '../store/exercise/exercise.store';
import { logDebug, logError } from '../../services/debug-logger';
import { CheckAuthBL, EnqueueLoadedReviewLogic } from '../process-bl';
import { GetDirectoryDriveIdProcess } from './drive';
import { VaultStore } from '../store/vault/vault.store';

export class RootPathNotDefined extends ProcessError {
  constructor() {
    super({
      process,
      message: `root path not defined`,
    });
  }
}

export class ConfigurationNotFound extends ProcessError {
  constructor(path: Path, fileName: string) {
    super({
      process,
      message: `root path ${path.join('/')} doesn't contain configuration file '${fileName}'`,
    });
  }
}

export class FailedToLoadConfigurationError extends ProcessError {
  constructor(path: Path, fileName: string) {
    super({
      process,
      message: `failed to load configuration ${path.join('/')}/'${fileName}'`,
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
      const vaultStore = inject(VaultStore);
      const configurationStore = inject(ConfigurationStore);
      const exerciseStore = inject(ExerciseStore);
      const enqueueReview = inject(EnqueueLoadedReviewLogic);
      const checkAuthProcess = inject(CheckAuthBL);
      const getDirectoryDriveIdProcess = inject(GetDirectoryDriveIdProcess);

      return loadConfigurationProcess({
        zipService,
        driveApi,
        vaultStore,
        configurationStore,
        exerciseStore,
        enqueueReview,
        checkAuthProcess,
        getDirectoryDriveIdProcess,
      });
    },
  },
);

const process = 'LoadConfigurationProcess';
function loadConfigurationProcess({
  zipService,
  driveApi,
  vaultStore,
  configurationStore,
  exerciseStore,
  enqueueReview,
  checkAuthProcess,
  getDirectoryDriveIdProcess,
}: {
  zipService: ZipService;
  driveApi: DriveApiService;
  vaultStore: VaultStore;
  configurationStore: ConfigurationStore;
  exerciseStore: ExerciseStore;
  enqueueReview: EnqueueLoadedReviewLogic;
  checkAuthProcess: CheckAuthBL;
  getDirectoryDriveIdProcess: GetDirectoryDriveIdProcess;
}): LoadConfigurationProcess {
  return async (path, fileName) => {
    logDebug(`${process} - start`, { includeStack: true });
    const accessToken = await checkAuthProcess();

    if (path.length === 0 || !fileName) {
      throw new RootPathNotDefined();
    }

    const rootId: string = await getDirectoryDriveIdProcess(accessToken, path);

    const { files } = await driveApi.listFiles(accessToken, rootId).catch((error): never => {
      logError(error, `${process} - failed to list files`, `dir: ${path.join('/')}`);

      // abort
      throw new FailedToLoadConfigurationError(path, fileName);
    });
    const configurationFile = files.find(
      ({ mimeType, name }) => mimeType === 'application/zip' && name === fileName,
    );

    if (!configurationFile) {
      throw new ConfigurationNotFound(path, fileName);
    }

    const configurationStream = await driveApi
      .getBinaryFileContent(accessToken, configurationFile.id)
      .catch((error): never => {
        logError(
          error,
          `${process} - failed to get file content`,
          `dir: ${path.join('/')}/${fileName}`,
        );

        // abort
        throw new FailedToLoadConfigurationError(path, fileName);
      });

    const configurationMap = await zipService.extractAllJSON(configurationStream).catch((error) => {
      logError(error, `${process} - failed extract content`, `${path.join('/')}/${fileName}`);

      // abort
      throw new FailedToLoadConfigurationError(path, fileName);
    });
    configurationStore.loadConfiguration({
      vaultRootPath: path,
      vaultRootPathDriveId: getDriveId(rootId!),
      vaultConfigurationName: fileName,
    });

    try {
      // configuration
      const configurationStorage = configurationMap[
        'configuration.json'
      ] as VaultConfigurationStorage;
      logDebug(`${process} - parsing configuration`, { payload: { configurationStorage } });
      configurationStore.setVaultConfiguration({ path: parsePath(configurationStorage.path) });

      // index
      const vaultIndexStorage = configurationMap['index.json'] as VaultIndexStorage;
      vaultIndexStorage.articles.forEach(
        ({ driveId, path, name, topics: links, tags, indexed, created }) => {
          logDebug(`${process} - parsing article`, { entity: `${path}/${name}` });
          const articleId: ArticleId = getArticleId(path, name);

          vaultStore.addArticle({
            articleId,
            article: { driveId, path, name, topics: links, tags, indexed, created },
          });
        },
      );

      logDebug(`${process} - parsing exercise configuration`, {
        payload: { exerciseConfiguration: vaultIndexStorage.exerciseConfiguration },
      });
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
      logDebug(`${process} - parsing reviews`);
      const reviews = configurationMap['results.json'] as ReviewStorage[];
      reviews.forEach((review) => {
        const articleId = getArticleId(review.path, review.name);
        enqueueReview(articleId, review);
      });
    } catch (error) {
      logError(
        error,
        `${process} - error while parsing vault configuration`,
        `${path.join('/')}/${fileName}`,
      );

      throw new ProcessUnhandledError({ process, cause: error });
    }

    logDebug(`${process} - finish`);
  };
}
