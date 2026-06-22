import { AppError } from './app-error';

export class ProcessError extends AppError {
  constructor({ process, message, cause }: { process: string; message: string; cause?: unknown }) {
    super(message, cause);
    this.process = process;
  }

  process: string;
}

export class ProcessUnhandledError extends ProcessError {
  constructor({ process, cause }: { process: string; cause: unknown }) {
    super({ process, message: 'unhandled process error', cause });
  }
}

export class ProcessNotImplementedError extends ProcessError {
  constructor({ process }: { process: string }) {
    super({ process, message: 'not implemented' });
  }
}
