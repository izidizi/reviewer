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
    const reviewsQueue = this.store.reviewsQueue();
    console.log('reviews added', reviewsQueue.length);

    this.processReviewQueue();
  });
}
