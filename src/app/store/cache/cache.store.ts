import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { initialCacheSlice } from './cache.slice';
import * as updaters from './cache.updaters';

export type CacheStore = InstanceType<typeof CacheStore>;

export const CacheStore = signalStore(
  { providedIn: 'root' },
  withState(initialCacheSlice),
  withMethods((store) => {
    return {
      cacheArticle: (data: updaters.CacheArticleData) =>
        patchState(store, updaters.cacheArticle(data)),
      removeArticle: (data: updaters.RemoveArticleData) =>
        patchState(store, updaters.removeArticle(data)),
    };
  }),
);
