import { driveApiErrorResponseParserFactory } from './drive-api-error-response-parser';
import { driveApiResponseParserFactory } from './drive-api-response-parser.method';

export function patchBlobFileFactory(
  driveApiErrorResponseParser: ReturnType<typeof driveApiErrorResponseParserFactory>,
  driveApiResponseParser: ReturnType<typeof driveApiResponseParserFactory>,
): (accessToken: string, id: string, name: string, data: Blob) => Promise<void> {
  return async (accessToken, id, name, data) => {
    const metadata = {
      name,
      mimeType: 'application/zip',
      parents: [id],
    };

    const body = new FormData();
    body.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], {
        type: 'application/json',
      }),
    );
    body.append('file', data);

    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body,
      },
    );

    const error = await driveApiErrorResponseParser(response);
    if (error) throw error;
  };
}
