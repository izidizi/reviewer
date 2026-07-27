import { Path } from './path';
import { DriveId } from './drive-id';
import { ArticleId } from './article-id';
import { InvalidDate } from '../../model/utils';

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
