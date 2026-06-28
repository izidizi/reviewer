import { effect, inject, Injectable } from '@angular/core';
import { VaultStateStore } from './vault-state.store';
import { ProcessReviewQueueProcess } from '../../processes/review';

@Injectable({
  providedIn: 'root',
})
export class VaultStateEffects {
  readonly store = inject(VaultStateStore);
  readonly processReviewQueue = inject(ProcessReviewQueueProcess);

  #reviewQueueEffect = effect(() => {
    this.processReviewQueue();
  });
}
