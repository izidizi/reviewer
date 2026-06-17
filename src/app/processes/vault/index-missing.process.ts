import { DriveApiService } from '../../../services/drive-api/drive-api.service';
import { CheckAuthProcess } from '../check-auth.process';
import { ConfigurationStore } from '../../store/configuration/configuration.store';
import { ArticleService } from '../../../services/article/article.service';
import { VaultIndexStore } from '../../store/vault-index/vault-index.store';
import { VaultIndexMissingProcess } from '.';
import { parsePath, Path } from '../../model/path';
import {
  DriveApiAuthenticationError,
  DriveApiFileNotFoundError,
  DriveApiUnexpectedAnswerError,
} from '../../../services/drive-api/drive-api-errors';
import { getArticleId } from '../../model/article-id';
import { DecisionTableService } from '../../../services/decision-table.service';
import { isValidDate } from '../../../model/utils/invalid-date';
import { VaultArticle } from '../../model/vault-article';
import { logDebug, logError } from '../../../services/debug-logger';
import { UserNotAuthorised } from '../../process-bl';
import { GetDirectoryDriveIdProcess } from '../drive';

const process = 'VaultIndexMissingProcess';
export function valutlIndexMissingProcess({
  driveApi,
  decisionService,
  articleService,
  configurationStore,
  vaultIndexStore,
  checkAuthProcess,
  getDirectoryDriveIdProcess,
}: {
  driveApi: DriveApiService;
  decisionService: DecisionTableService;
  articleService: ArticleService;
  configurationStore: ConfigurationStore;
  vaultIndexStore: VaultIndexStore;
  checkAuthProcess: CheckAuthProcess;
  getDirectoryDriveIdProcess: GetDirectoryDriveIdProcess;
}): VaultIndexMissingProcess {
  const shouldReindex = createReindexDecisionProcessor(decisionService);

  return async ({ reindexArticlesWithInvalidIndexDate, reindexArticlesOlderThan }) => {
    logDebug(`${process} - start`, { includeStack: true });

    const accessToken = await checkAuthProcess();

    const path: Path = configurationStore.path();

    vaultIndexStore.startVaultIndex({ mode: 'new', started: new Date() });

    const rootId = await getDirectoryDriveIdProcess(accessToken, path);

    const foldersToRead: { id: string; path: string }[] = [{ id: rootId, path: path.join('/') }];
    const foundFiles: { id: string; path: string; name: string }[] = [];

    while (foldersToRead.length > 0) {
      const folderInfo = foldersToRead.shift();
      if (!folderInfo) break;

      const { files } = await driveApi.listFiles(accessToken, folderInfo.id).catch((error) => {
        logError(error, `${process} - failed to list files`, `dir: ${folderInfo.path}`);
        if (error instanceof DriveApiAuthenticationError) {
          // abort the process
          throw new UserNotAuthorised();
        } else if (error instanceof DriveApiFileNotFoundError) {
          // continue
        } else if (error instanceof DriveApiUnexpectedAnswerError) {
          // continue
        }

        return { files: [] };
      });

      files.forEach((file) => {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          foldersToRead.push({
            id: file.id,
            path: folderInfo.path + (folderInfo.path !== '' ? '/' : '') + file.name,
          });
        } else if (file.name.slice(-3) === '.md') {
          foundFiles.push({ name: file.name, path: folderInfo.path, id: file.id });
        }
      });
    }

    let totalIndexed = 0;
    const articles = vaultIndexStore.articles();

    for (const file of foundFiles) {
      const articleId = getArticleId(file.path, file.name);

      const articleReindexRule = genereateArticleReindexRule(
        articles[articleId],
        reindexArticlesWithInvalidIndexDate,
        reindexArticlesOlderThan,
      );
      const shouldReindexArticle = shouldReindex(articleReindexRule);
      if (shouldReindexArticle === false) {
        logDebug(`${process} - skipped`, {
          entity: articleId,
          payload: articleReindexRule,
        });
        continue;
      }

      const fileContent = await driveApi.getTextFileContent(accessToken, file.id).catch((error) => {
        logError(
          error,
          `${process} - failed to get file content`,
          `file: ${file.path}/${file.name}`,
        );
        if (error instanceof DriveApiAuthenticationError) {
          // abort the process
          throw new UserNotAuthorised();
        } else if (error instanceof DriveApiFileNotFoundError) {
          // continue
        } else if (error instanceof DriveApiUnexpectedAnswerError) {
          // continue
        }

        return null;
      });

      if (fileContent !== null) {
        const article = articleService.parseArticle({
          ...file,
          driveId: file.id,
          text: fileContent,
          pathTopic: parsePath(file.path)[1],
        });

        totalIndexed += 1;
        vaultIndexStore.indexArticle(article);
        vaultIndexStore.updateVaultIndex({
          lastIndexed: article.articleId,
          totalIndexed,
        });

        logDebug(`${process} - article reindexed`, { entity: article.articleId, payload: article });
      }
    }

    vaultIndexStore.finishVaultIndex({
      status: 'ok',
      totalIndexed,
      finished: new Date(),
    });

    logDebug(`${process} - finish`, { includeStack: true });
  };
}

type ArticleReindexRule = {
  articleExists: boolean;
  articleHasInvalidIndexDate: boolean;
  reindexArticlesWithInvalidIndexDate: boolean;
  articleIndexDateOlderThatThreshold: boolean;
  reindexOldArciles: boolean;
};

function createReindexDecisionProcessor(service: DecisionTableService) {
  return service.decisionProcessor<ArticleReindexRule>(
    [
      'articleExists',
      'articleHasInvalidIndexDate',
      'reindexArticlesWithInvalidIndexDate',
      'articleIndexDateOlderThatThreshold',
      'reindexOldArciles',
    ],
    [
      // reindex all non existent articles
      { rule: { articleExists: false }, outcome: true },

      // reindex article with invaled index date, but only when requested
      {
        rule: { articleHasInvalidIndexDate: true, reindexArticlesWithInvalidIndexDate: true },
        outcome: true,
      },

      // reindex article older that threshold, but only when requested
      {
        rule: { articleIndexDateOlderThatThreshold: true, reindexOldArciles: true },
        outcome: true,
      },
    ],
  );
}

function genereateArticleReindexRule(
  article: VaultArticle | undefined,
  reindexArticlesWithInvalidIndexDate: boolean,
  reindexArticlesOlderThan: Date = new Date(0),
): ArticleReindexRule {
  const articleIndexDateOlderThatThreshold =
    !!article && isValidDate(article.indexed) && article.indexed < reindexArticlesOlderThan;

  return {
    articleExists: !!article,
    articleHasInvalidIndexDate: article ? isValidDate(article.indexed) === false : false,
    reindexArticlesWithInvalidIndexDate,
    articleIndexDateOlderThatThreshold,
    reindexOldArciles: !!reindexArticlesOlderThan,
  };
}
