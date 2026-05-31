import { driveApiErrorResponseParserFactory } from './drive-api-error-response-parser';
import { driveApiResponseParserFactory } from './drive-api-response-parser.method';

export function deleteFileFactory(
  driveApiErrorResponseParser: ReturnType<typeof driveApiErrorResponseParserFactory>,
  driveApiResponseParser: ReturnType<typeof driveApiResponseParserFactory>,
): (accessToken: string, fileId: string) => Promise<void> {
  return async (accessToken, fileId) => {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const error = await driveApiErrorResponseParser(response);
    if (error) throw error;
  };
}
