import { driveApiErrorResponseParserFactory } from './drive-api-error-response-parser';
import { driveApiResponseParserFactory } from './drive-api-response-parser.method';

export function getTextFileContentFactory(
  driveApiErrorResponseParser: ReturnType<typeof driveApiErrorResponseParserFactory>,
  driveApiResponseParser: ReturnType<typeof driveApiResponseParserFactory>,
): (accessToken: string, id: string) => Promise<string> {
  return async (accessToken, id) => {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const error = await driveApiErrorResponseParser(response);
    if (error) throw error;

    return driveApiResponseParser(response);
  };
}
