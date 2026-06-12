import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { version } from '../../package.json';
import { logError, logInfo } from './debug-logger';
import { AppError } from '../model/error/app-error';

type AppConfig = { env: string; client_id: string };

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  readonly http = inject(HttpClient);

  #callState: 'no-config' | 'loading' | 'ready' = 'no-config';

  #version = signal<string>(version);
  readonly version = this.#version.asReadonly();

  #client_id = signal<string | null>(null);
  readonly isConfigurationReady = computed(() => {
    const client_id = this.#client_id();
    return this.#callState === 'ready' && client_id !== null;
  });
  readonly client_id = computed(() => {
    const isReady = this.isConfigurationReady();
    const client_id = this.#client_id();

    if (isReady) return client_id;

    throw logError(
      new AppError(
        `attempted to get configuration parameter 'client_id' while configuration is not yet ready `,
      ),
      'ConfigurationService/client_id',
    );
  });

  #env = signal<string | null>(null);
  readonly env = computed<string>(() => {
    const isReady = this.isConfigurationReady();
    const env = this.#env();

    if (isReady && env !== null) return env;

    throw logError(
      new AppError(
        `attempted to get configuration parameter 'env' while configuration is not yet ready `,
      ),
      'ConfigurationService/env',
    );
  });

  readonly init = async () => {
    logInfo('loading confguration', 'ConfigurationService/init', {});
    if (this.#callState !== 'no-config') {
      throw logError(
        new AppError('attempted to load configuration once again'),
        'ConfigurationService/init',
      );
    }

    this.#callState = 'loading';

    await firstValueFrom(this.http.get<AppConfig>('config.json'))
      .then((config) => {
        const { env, client_id } = config;
        this.#callState = 'ready';
        this.#env.set(env);
        this.#client_id.set(client_id);
      })
      .catch((error) => {
        this.#callState = 'no-config';
        throw logError(
          new AppError('failed to load configuraion', error),
          'ConfigurationService/parsing',
        );
      });
  };
}
