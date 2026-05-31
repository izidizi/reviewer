import { CallState } from './call-state';

export interface AuthSlice {
  accessToken: string | null;
  callState: CallState;
}

export const initialAuthSlice: AuthSlice = {
  accessToken: null,
  callState: {
    callState: 'initial',
  },
};
