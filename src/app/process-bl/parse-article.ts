import { inject, InjectionToken } from '@angular/core';
import { ArticleId, generate } from '../model/article-id';
import { createPath, isPath, parsePath, Path } from '../../app/model/path';
import { parseDate } from '../../model/utils/invalid-date';
import { VaultIndexArticleStorage } from '../../model/storage/vault-index';
import { ConfigurationStore } from '../store/configuration/configuration.store';
import { dateToISO80601String } from '../../model/utils/iso8601-string';

export type ParseArticleLogic = (data: {
  driveId: string;
  path: string | Path;
  name: string;
  text: string;
  pathTopic: string;
}) => { articleId: ArticleId; article: VaultIndexArticleStorage; content: string };
export const ParseArticleLogic = new InjectionToken<ParseArticleLogic>('ParseArticleLogic', {
  providedIn: 'root',
  factory: () => {
    const configuration = inject(ConfigurationStore);

    return ({ driveId, path, name, text }) => {
      const indexPath = configuration.path();

      const topicsIndex = text.indexOf('### Links');
      const topicsConent = text.substring(topicsIndex);
      const cutIndexReferences = text.indexOf('### References');
      const cutIndexLinks = text.indexOf('### Links');
      const cutIndex = cutIndexReferences > 0 ? cutIndexReferences : cutIndexLinks;
      const content = cutIndex > 0 ? text.substring(0, cutIndex) : text;
      const createdIndex = text.indexOf('created::');
      let created = parseDate(null);
      if (createdIndex > 0) {
        let createdText = text.slice(createdIndex + 9).trim();
        created = parseDate(createdText.slice(0, 16));
      }

      let topics = parseTopics(topicsConent);
      const pathTopic = getPathTopic(isPath(path) ? path : parsePath(path), indexPath);
      if (pathTopic && !topics.includes(pathTopic)) topics = [pathTopic, ...topics];

      const article: VaultIndexArticleStorage = {
        driveId,
        path: isPath(path) ? createPath(path) : path,
        name,
        tags: parseTags(content),
        topics,
        indexed: dateToISO80601String(new Date()),
        created: dateToISO80601String(created),
      };

      return {
        articleId: generate(isPath(path) ? path : parsePath(path), name),
        article,
        content,
      };
    };
  },
});

function parseTopics(text: string): string[] {
  return text
    .split('[')
    .map((chunk) => (chunk.indexOf(']') > 0 ? chunk.split(']')[0] : null))
    .filter((link) => link !== null);
}

function parseTags(text: string): string[] {
  const tagLines = text
    .replaceAll('\r', '\n')
    .split('\n')
    .filter((line) => line.length > 0 && line.trim().startsWith('tags:'));

  return tagLines
    .map((line) =>
      line
        .replaceAll('tags:', '')
        .split(' ')
        .filter((tag) => tag.length > 0),
    )
    .flat();
}

function getPathTopic(path: Path, indexPath: Path): string | null {
  const tt = [...path];
  indexPath.forEach((item) => {
    if (tt[0] === item) tt.shift();
  });
  return tt.length > 0 ? tt[0] : null;
}
