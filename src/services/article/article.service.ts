import { Injectable } from '@angular/core';
import { generate } from '../../app/model/article-id';
import { VaultArticle } from '../../app/model/vault-article';
import { getDriveId } from '../../app/model/drive-id';
import { getPath, isPath, parsePath, Path } from '../../app/model/path';
import { parseDate } from '../../model/utils/invalid-date';

/**
 * @deprecated use corresponding logics
 */

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  parseArticle({
    driveId,
    path,
    name,
    text,
    pathTopic,
  }: {
    driveId: string;
    path: string | Path;
    name: string;
    text: string;
    pathTopic: string;
  }): VaultArticle {
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

    let topics = this.parseTopics(topicsConent);
    if (!topics.includes(pathTopic)) topics = [pathTopic, ...topics];

    return {
      articleId: generate(getPath(path), name),
      driveId: getDriveId(driveId),
      path: isPath(path) ? path : parsePath(path),
      name,
      tags: this.parseTags(content),
      topics,
      indexed: new Date(),
      created,
    };
  }

  parseTopics(text: string): string[] {
    return text
      .split('[')
      .map((chunk) => (chunk.indexOf(']') > 0 ? chunk.split(']')[0] : null))
      .filter((link) => link !== null);
  }

  parseTags(text: string): string[] {
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
}
