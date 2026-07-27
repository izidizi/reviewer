import { AppError } from '../../../model/error/app-error';

export class InvalidArticleIdError extends AppError {
  constructor() {
    super(`Invalid ArticleId`);
  }
}
