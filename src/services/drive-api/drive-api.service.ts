import { Injectable } from '@angular/core';
import { initScriptFactory } from './init-script.method';
import { initClientFactory } from './init-client.method';
import { requestAccessTokenFactory } from './request-access-token.method';
import { getTextFileContentFactory } from './get-text-file-content.method';
import { driveApiResponseParserFactory } from './drive-api-response-parser.method';
import { listFilesFactory } from './list-files.method';
import { driveApiErrorResponseParserFactory } from './drive-api-error-response-parser';
import { getBinaryFileContentFactory } from './get-binary-file-content';
import { patchBlobFileFactory as uploadBlobFileFactory } from './patch-blob-file.method';
import { deleteFileFactory } from './delete-file.method';
import { getFileCapabilitiesFactory } from './get-file-capabilities';

export type DriveApiServiceState = {
  scriptReady: boolean;
  tokenClient: google.accounts.oauth2.TokenClient | null;
  accessTokenCallbackFn: ((payload: { token: string } | { error: string }) => void) | null;
};

@Injectable({
  providedIn: 'root',
})
export class DriveApiService {
  readonly #state: DriveApiServiceState = {
    scriptReady: false,
    tokenClient: null,
    accessTokenCallbackFn: null,
  };

  public get isScriptReady(): boolean {
    return this.#state.scriptReady;
  }

  public get isClientReady(): boolean {
    return this.#state.tokenClient !== null;
  }

  private driveApiErrorResponseParser = driveApiErrorResponseParserFactory();
  private driveApiResponseParser = driveApiResponseParserFactory();

  readonly initScript = initScriptFactory(this.#state);
  readonly initClient = initClientFactory(this.#state);
  readonly requestAccessToken = requestAccessTokenFactory(this.#state);

  readonly getTextFileContent = getTextFileContentFactory(
    this.driveApiErrorResponseParser,
    this.driveApiResponseParser,
  );
  readonly getBinaryFileContent = getBinaryFileContentFactory(this.driveApiErrorResponseParser);
  readonly listFiles = listFilesFactory(
    this.driveApiErrorResponseParser,
    this.driveApiResponseParser,
  );

  readonly uploadBlobFile = uploadBlobFileFactory(
    this.driveApiErrorResponseParser,
    this.driveApiResponseParser,
  );

  readonly deleteFile = deleteFileFactory(
    this.driveApiErrorResponseParser,
    this.driveApiResponseParser,
  );

  readonly getFileCapabilities = getFileCapabilitiesFactory(
    this.driveApiErrorResponseParser,
    this.driveApiResponseParser,
  );
}
