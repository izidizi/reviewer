import { ArticleId } from '../../model/article-id';

export type CacheSlice = {
  articlesContent: {
    [articleId: ArticleId]:
      | {
          timestamp: Date;
          content: string;
        }
      | undefined;
  };
};

export const initialCacheSlice: CacheSlice = {
  articlesContent: {},
};
