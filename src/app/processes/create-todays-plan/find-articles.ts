import { VaultArticle } from '../../model/vault-article';

export function findArticles(
  configuration: {
    includeTags: string[];
    includeTopics: string[];
    excludeTags: string[];
    excludeTopics: string[];
  },
  articles: VaultArticle[],
): VaultArticle[] {
  const results: VaultArticle[] = [];

  for (const article of articles) {
    let include =
      configuration.includeTags.length === 0 && configuration.includeTopics.length === 0;

    if (haveIntersection(article.tags, configuration.includeTags)) include = true;
    if (haveIntersection(article.topics, configuration.includeTopics)) include = true;

    if (haveIntersection(article.tags, configuration.excludeTags)) include = false;
    if (haveIntersection(article.topics, configuration.excludeTopics)) include = false;

    if (include) results.push(article);
  }
  return results;
}

function haveIntersection(listA: string[], listB: string[]): boolean {
  for (const itemA of listA) {
    if (listB.includes(itemA)) return true;
  }

  return false;
}
