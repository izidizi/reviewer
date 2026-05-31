import { parsePath, Path } from './path';

declare const ArticleIdTypeBrand: unique symbol;
export type ArticleId = string & { [ArticleIdTypeBrand]: true };

export function getArticleId(path: Path | string, name: string): ArticleId {
  return `${typeof path === 'string' ? path : path.join('/')}/${name}` as ArticleId;
}

export function parseArticleId(articleId: ArticleId): { path: Path; name: string | undefined } {
  const path = parsePath(articleId);
  const name = path.pop();
  return { path, name };
}
