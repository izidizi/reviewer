import { DriveApiServiceState } from './drive-api.service';

export function initClientFactory(state: DriveApiServiceState): () => void {
  return () => {
    console.log('client_id', state.client_id);
    state.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: state.client_id ?? '',
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
