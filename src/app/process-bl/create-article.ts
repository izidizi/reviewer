import { InjectionToken } from '@angular/core';
import { generate } from '../model/article-id';
import { parsePath } from '../../app/model/path';
import { parseDate } from '../../model/utils/invalid-date';
import { VaultIndexArticleStorage } from '../../model/storage/vault-index';
import { getDriveId } from '../model/drive-id';
import { VaultArticle } from '../model/vault-article';

export type CreateArticleLogic = (data: VaultIndexArticleStorage) => VaultArticle;
export const CreateArticleLogicToken = new InjectionToken<CreateArticleLogic>(
  'CreateArticleLogic',
  {
    providedIn: 'root',
    factory: () => createArticleLogic,
  },
);

export const createArticleLogic: CreateArticleLogic = ({
  driveId,
  path,
  name,
  tags,
  topics,
  indexed,
  created,
}) => ({
  driveId: getDriveId(driveId),
  articleId: generate(parsePath(path), name),
  path: parsePath(path),
  name,
  tags,
  topics,
  indexed: parseDate(indexed),
  created: parseDate(created),
});
