import { inject, InjectionToken } from '@angular/core';
import { ArticleId, toArticleId } from '../model/article-id';
import { AppError } from '../../model/error/app-error';
import { parsePath, Path } from '../model/path';

export class InvalidArticleIdError extends AppError {
  constructor(id: string) {
    super(`[${id}] is not valid ArticleId`);
  }
}

export type CreateArticleIdBL = (url: string) => ArticleId;
export const CreateArticleIdBL = new InjectionToken<CreateArticleIdBL>('CreateArticleIdBL', {
  providedIn: 'root',
  factory: () => {
    const parseArticleId = inject(ParseArticleIdBL);

    return (url: string) => {
      const articleId = toArticleId(url);
      parseArticleId(articleId);
      return articleId;
    };
  },
});

export type ParseArticleIdBL = (articleId: ArticleId) => { path: Path; name: string };
export const ParseArticleIdBL = new InjectionToken<ParseArticleIdBL>('ParseArticleIdBL', {
  providedIn: 'root',
  factory: () => {
    return (articleId) => {
      const path = parsePath(articleId);
      const name = path.pop();
      if (!name || name.slice(-3) !== '.md') throw new InvalidArticleIdError(articleId);
      return { path, name };
    };
  },
});
