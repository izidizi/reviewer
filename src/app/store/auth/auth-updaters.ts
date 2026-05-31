import { PartialStateUpdater } from '@ngrx/signals';
import { AuthSlice } from './auth.slice';

export const startLoading: () => PartialStateUpdater<AuthSlice> = () => {
  return () => ({
    accessToken: null,
    callState: {
      callState: 'in-progress',
    },
  });
};

export const accessTokenIsReady: (accessToken: string) => PartialStateUpdater<AuthSlice> = (
  accessToken,
) => {
  return () => ({
    accessToken,
    callState: {
      callState: 'loaded',
    },
  });
};

export const loadFailed: (error: Error) => PartialStateUpdater<AuthSlice> = (error) => {
  return () => ({
    accessToken: null,
    callState: {
      callState: 'error',
      error,
    },
  });
};

export const accessTokenReset: () => PartialStateUpdater<AuthSlice> = () => {
  return () => ({
    accessToken: null,
    callState: {
      callState: 'reset',
    },
  });
};
