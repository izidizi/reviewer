import { driveApiErrorResponseParserFactory } from './drive-api-error-response-parser';

export function getBinaryFileContentFactory(
  driveApiErrorResponseParser: ReturnType<typeof driveApiErrorResponseParserFactory>,
): (accessToken: string, id: string) => Promise<ArrayBuffer> {
  return async (accessToken, id) => {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // const error = await driveApiErrorResponseParser(response);
    // if (error) throw error;

    return response.arrayBuffer();
  };
}
