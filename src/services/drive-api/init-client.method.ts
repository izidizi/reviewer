import { DriveApiServiceState } from './drive-api.service';

export function initClientFactory(state: DriveApiServiceState): () => void {
  return () => {
    state.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: '271879809225-2u5slvf39eoei11abbmvngsftlttegd2.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/drive',
      callback: (response) => {
        if (state.accessTokenCallbackFn) {
          if (response.error) {
            state.accessTokenCallbackFn({
              error: `google drive client initialization error: ${response.error}`,
            });
          } else {
            state.accessTokenCallbackFn({ token: response.access_token });
          }
        }
      },
    });
  };
}
