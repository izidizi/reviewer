import { DriveApiServiceState } from './drive-api.service';

export function initScriptFactory(state: DriveApiServiceState): () => Promise<void> {
  return () =>
    new Promise<void>((resolve, reject) => {
      const initTimeout = setTimeout(() => {
        state.scriptReady = false;
        state.tokenClient = null;
        document.removeChild(gsiScript);
        reject(new Error('google drive script initialization timeout'));
      }, 3000);

      const gsiScript = document.createElement('script');
      gsiScript.src = 'https://accounts.google.com/gsi/client';
      gsiScript.onload = () => {
        state.scriptReady = true;
        state.tokenClient = null;
        clearTimeout(initTimeout);
        resolve();
      };
      document.head.appendChild(gsiScript);
    });
}
