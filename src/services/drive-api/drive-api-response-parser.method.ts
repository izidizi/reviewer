import { DriveApiErrorResponse } from './drive-api-error-response';
import {
  DriveApiAuthenticationError,
  DriveApiError,
  DriveApiFileNotFoundError,
} from './drive-api-errors';

export function driveApiResponseParserFactory(): (response: Response) => Promise<string> {
  return async (response) => {
    let text = '';

    if (response.body) {
      const decoder = new TextDecoder();
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        text += decoder.decode(value, { stream: true });
      }
    }

    if (response.status !== 200) {
      throw identifyError(text);
    }

    return text;
  };
}

function identifyError(text: string): DriveApiError {
  const errorResponse: DriveApiErrorResponse = JSON.parse(text);
  if (errorResponse.error.code === 401 && errorResponse.error.status === 'UNAUTHENTICATED') {
    return new DriveApiAuthenticationError(errorResponse.error.message);
  } else if (errorResponse.error.code === 404) {
    return new DriveApiFileNotFoundError(errorResponse.error.message);
  } else {
    console.warn(errorResponse.error);
  }

  return new DriveApiError(errorResponse.error.message);
}
