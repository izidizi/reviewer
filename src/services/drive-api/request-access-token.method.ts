import { DriveApiServiceState } from './drive-api.service';

export function requestAccessTokenFactory(state: DriveApiServiceState): () => Promise<string> {
  return () =>
    new Promise((resolve, reject) => {
      if (state.scriptReady === false) {
        reject(new Error('google drive script not inited'));
      } else if (state.tokenClient === null) {
        reject(new Error('google drive client not inited'));
      } else {
        state.accessTokenCallbackFn = (payload) => {
          if ('token' in payload) {
            resolve(payload.token);
          } else if ('error' in payload) {
            reject(new Error(payload.error));
          } else {
            reject(new Error('google drive client unknown answer'));
          }
        };

        state.tokenClient.requestAccessToken();
      }
    });
}
