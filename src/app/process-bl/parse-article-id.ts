import { InjectionToken } from '@angular/core';
import { ArticleId, generate, from, parse, InvalidArticleId, fromUrl } from '../model/article-id';
import { isPath, parsePath, Path } from '../model/path';

export type GenerateArticleIdLogic = (path: Path | string, name: string) => ArticleId;
export const GenerateArticleIdLogic = new InjectionToken<GenerateArticleIdLogic>(
  'GenerateArticleIdLogic',
  {
    providedIn: 'root',
    factory: () => {
      return (path: Path | string, name: string) =>
        generate(isPath(path) ? path : parsePath(path), name);
    },
  },
);

export type CreateArticleIdFromStringLogic = (raw: string) => ArticleId;
export const CreateArticleIdFromStringLogic = new InjectionToken<CreateArticleIdFromStringLogic>(
  'CreateArticleIdFromStringLogic',
  {
    providedIn: 'root',
    factory: () => {
      return (raw: string) => {
        const parts = raw.split('/');
        const name = parts.splice(-1, 1);
        return generate(parts, name[0]);
      };
    },
  },
);

export type TryCreateArticleIdFromStringLogic = (raw: string) => ArticleId | InvalidArticleId;
export const TryCreateArticleIdFromStringLogic =
  new InjectionToken<TryCreateArticleIdFromStringLogic>('TryCreateArticleIdFromStringLogic', {
    providedIn: 'root',
    factory: () => {
      return (raw: string) => from(raw);
    },
  });

export type TryCreateArticleIdFromUrlLogic = (url: string) => ArticleId | InvalidArticleId;
export const TryCreateArticleIdFromUrlLogic = new InjectionToken<TryCreateArticleIdFromStringLogic>(
  'TryCreateArticleIdFromUrlLogic',
  {
    providedIn: 'root',
    factory: () => {
      return (raw: string) => fromUrl(raw);
    },
  },
);

export type CreateArticleIdBL = (url: string) => ArticleId;
export const CreateArticleIdBL = new InjectionToken<CreateArticleIdBL>('CreateArticleIdBL', {
  providedIn: 'root',
  factory: () => {
    return (url: string) => {
      const parts = url.split('/');
      const name = parts.splice(-1, 1);
      return generate(parts, name[0]);
    };
  },
});

export type ParseArticleIdLogic = (articleId: ArticleId) => { path: Path; name: string };
export const ParseArticleIdLogic = new InjectionToken<ParseArticleIdLogic>('ParseArticleIdLogic', {
  providedIn: 'root',
  factory: () => {
    return (articleId) => parse(articleId);
  },
});
