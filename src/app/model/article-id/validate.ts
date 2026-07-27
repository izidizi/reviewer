import { InvalidArticleIdError } from './errors';
import { ArticleIdContent } from './parse';

export function validate(content: Partial<ArticleIdContent>): asserts content is ArticleIdContent {
  if (
    content.path === undefined ||
    content.name === undefined ||
    content.name.length === 0 ||
    content.name.slice(-3) !== '.md'
  )
    throw new InvalidArticleIdError();
}
