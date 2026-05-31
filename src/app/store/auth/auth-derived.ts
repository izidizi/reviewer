import { StateSignals } from '@ngrx/signals';
import { AuthSlice } from './auth.slice';
import { computed } from '@angular/core';

export function authDerived(store: StateSignals<AuthSlice>) {
  const isAuthed = computed(() => store.accessToken() !== null);
  const isPending = computed(() => !isAuthed() && store.callState().callState === 'in-progress');

  return {
    isAuthed,
    isPending,
  };
}
