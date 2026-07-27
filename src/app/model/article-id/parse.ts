import { parsePath, Path } from '../path';

export type ArticleIdContent = {
  path: Path;
  name: string;
};

export function parseFromString(articleId: string): Partial<ArticleIdContent> {
  const path = parsePath(articleId);
  const name = path.pop();
  return { path, name };
}
