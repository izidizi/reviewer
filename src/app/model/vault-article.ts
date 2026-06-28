import { parsePath, Path } from './path';
import { DriveId, getDriveId } from './drive-id';
import { ArticleId, getArticleId } from './article-id';
import { InvalidDate } from '../../model/utils';
import { VaultIndexArticleStorage } from '../../model/storage/vault-index';
import { parseDate } from '../../model/utils/invalid-date';

export type VaultArticle = {
  articleId: ArticleId;
  driveId: DriveId;
  path: Path;
  name: string;
  tags: string[];
  topics: string[];
  indexed: Date | InvalidDate;
  created: Date | InvalidDate;
};

export function createArticle({
  driveId,
  path,
  name,
  tags,
  topics,
  indexed,
  created,
}: VaultIndexArticleStorage): VaultArticle {
  const articleId = getArticleId(path, name);
  return {
    driveId: getDriveId(driveId),
    articleId,
    path: parsePath(path),
    name,
    tags,
    topics,
    indexed: parseDate(indexed),
    created: parseDate(created),
  };
}
