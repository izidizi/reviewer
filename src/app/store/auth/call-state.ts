export type CallState<ErrorType = Error> = {
  callState: 'initial' | 'reset' | 'in-progress' | 'loaded' | 'error';
  error?: ErrorType;
};
