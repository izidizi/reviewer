import { driveApiErrorResponseParserFactory } from './drive-api-error-response-parser';
import { DriveApiUnexpectedAnswerError } from './drive-api-errors';
import { driveApiResponseParserFactory } from './drive-api-response-parser.method';
import * as validators from './validators';

export type ListFilesResponse = {
  files: DriveFile[];
  kind: string;
  incompleteSearch: boolean;
};

export type DriveFile = {
  kind: string;
  mimeType: string;
  id: string;
  name: string;
  resourceKey: string;
};

export function listFilesFactory(
  driveApiErrorResponseParser: ReturnType<typeof driveApiErrorResponseParserFactory>,
  driveApiResponseParser: ReturnType<typeof driveApiResponseParserFactory>,
): (accessToken: string, id: string) => Promise<ListFilesResponse> {
  return async (accessToken, id) => {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q='${id}' in parents`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const error = await driveApiErrorResponseParser(response);
    if (error) throw error;

    const text = await driveApiResponseParser(response);
    let result: ListFilesResponse;
    try {
      result = JSON.parse(text);
    } catch (error) {
      throw new DriveApiUnexpectedAnswerError('response is not a valid JSON', { cause: error });
    }

    if ('files' in result === false || Array.isArray(result.files) === false) {
      throw new DriveApiUnexpectedAnswerError(
        'expected result to contain [files] field, that is an array',
      );
    }
    if ('kind' in result === false || typeof result.kind !== 'string') {
      throw new DriveApiUnexpectedAnswerError(
        'expected result to contain kind field, that is a string',
      );
    }

    result.files.forEach((file, index) => {
      if (!validators.isNotEmptyString(file.id)) {
        throw new DriveApiUnexpectedAnswerError(
          `file #${index} [id] field expected to be not empty string`,
        );
      }

      if (!validators.isNotEmptyString(file.kind)) {
        throw new DriveApiUnexpectedAnswerError(
          `file #${index} [kind] field expected to be not empty string`,
        );
      }

      if (!validators.isNotEmptyString(file.mimeType)) {
        throw new DriveApiUnexpectedAnswerError(
          `file #${index} [mimeType] field expected to be not empty string`,
        );
      }

      if (!validators.isString(file.resourceKey, { canBeNull: false, mustBeDefined: false })) {
        throw new DriveApiUnexpectedAnswerError(
          `file #${index} [resourceKey] field expected to be not empty string`,
        );
      }

      if (!validators.isNotEmptyString(file.name)) {
        throw new DriveApiUnexpectedAnswerError(
          `file #${index} [name] field expected to be not empty string`,
        );
      }
    });

    return result;
  };
}
