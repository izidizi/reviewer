import { parsePath, Path } from './path';

declare const ArticleIdTypeBrand: unique symbol;
export type ArticleId = string & { [ArticleIdTypeBrand]: true };

export function toArticleId(value: string): ArticleId {
  return value as ArticleId;
}

export function getArticleId(path: Path | string, name: string): ArticleId {
  return `${typeof path === 'string' ? path : path.join('/')}/${name}` as ArticleId;
}

/**
 * @deprecated use ParseArticleIdBL
 */
export function parseArticleId(articleId: ArticleId): { path: Path; name: string | undefined } {
  const path = parsePath(articleId);
  const name = path.pop();
  return { path, name };
}

export function parserArticleIdFromURL(url: string): ArticleId | null {
  url = decodeURI(url.trim());
  url = url.indexOf('/') === 0 ? url.slice(1) : url;
  const path = url.split('/');
  const name = path.pop();
  if (!name) return null;
  return getArticleId(path, name);
}
