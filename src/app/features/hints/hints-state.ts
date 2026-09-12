import { computed, Injectable, signal } from '@angular/core';

@Injectable()
export class HintsState {
  private readonly state = signal<
    {
      text: string;
      maskedText: string;
      isTaken: boolean;
    }[]
  >([]);

  readonly hints = this.state.asReadonly();

  readonly hasHints = computed(() => {
    const hints = this.state();
    return hints.length > 0;
  });

  readonly allTaken = computed(() => {
    const state = this.state();

    return state.every(({ isTaken }) => isTaken);
  });

  reset(hints: string[]) {
    this.state.set(
      hints.map((text) => ({
        text,
        maskedText: text.replace(/[a-zA-Zа-яА-ЯёЁ0-9]/g, 'x'),
        isTaken: false,
      })),
    );
  }

  takeNext() {
    const newState = [...this.state()];
    for (let hint of newState) {
      if (!hint.isTaken) {
        hint.maskedText = hint.text;
        hint.isTaken = true;
        break;
      }
    }

    this.state.set(newState);
  }
}
