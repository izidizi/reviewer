import { effect, Injectable, Signal, signal } from '@angular/core';

const storageValutKey = 'vaults';

@Injectable()
export class VaultService {
  constructor() {
    try {
      const vaults: string[] = JSON.parse(localStorage.getItem(storageValutKey) ?? '[]');
      this.#availableVaults.set(vaults);
    } catch (ex) {
      this.#availableVaults.set([]);
    }
  }

  readonly #availableVaults = signal<string[]>([]);

  readonly onChange = effect(() => {
    const vaults = this.#availableVaults();
    localStorage.setItem(storageValutKey, JSON.stringify(vaults));
  });

  public get availableVaults(): Signal<string[]> {
    return this.#availableVaults.asReadonly();
  }

  addVault(vault: string) {
    const vaults = [...this.#availableVaults(), vault];
    this.#availableVaults.set(vaults);
  }

  removeVault(vault: string) {}
}
