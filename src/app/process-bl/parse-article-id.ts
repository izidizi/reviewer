import { InjectionToken } from '@angular/core';
import { ArticleId } from '../model/article-id';
import { AppError } from '../../model/error/app-error';
import { parsePath, Path } from '../model/path';

export class InvalidArticleIdError extends AppError {
  constructor(id: string) {
    super(`[${id}] is not valid ArticleId`);
  }
}

export type ParseArticleIdBL = (articleId: ArticleId) => { path: Path; name: string };
export const ParseArticleIdBL = new InjectionToken<ParseArticleIdBL>('ParseArticleIdBL', {
  providedIn: 'root',
  factory: () => {
    return (articleId) => {
      const path = parsePath(articleId);
      const name = path.pop();
      if (!name) throw new InvalidArticleIdError(articleId);
      return { path, name };
    };
  },
});
