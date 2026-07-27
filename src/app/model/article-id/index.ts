import { Path } from '../path';
import { ArticleIdContent, parseFromString } from './parse';
import { validate } from './validate';

declare const articleIdTypeBrand: unique symbol;
export type ArticleId = string & { [articleIdTypeBrand]: true };

declare const invalieArticleIdTypeBrand: unique symbol;
export type InvalidArticleId = string & { [invalieArticleIdTypeBrand]: true };

export type { ArticleIdContent } from './parse';

export function generate(path: Path, name: string): ArticleId {
  const content = { path, name };
  validate(content);
  return (path.join('/') + '/' + name) as ArticleId;
}

export function from(raw: string): ArticleId | InvalidArticleId {
  const content = parseFromString(raw);

  try {
    validate(content);
  } catch {
    return raw as InvalidArticleId;
  }

  return raw as ArticleId;
}

export function isValid(articleId: ArticleId | InvalidArticleId): articleId is ArticleId {
  const content = parseFromString(articleId);

  try {
    validate(content);
  } catch {
    return false;
  }

  return true;
}

export function parse(articleId: ArticleId): ArticleIdContent {
  return parseFromString(articleId) as ArticleIdContent;
}
