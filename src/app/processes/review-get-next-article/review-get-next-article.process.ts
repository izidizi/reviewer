import { ReviewGetNextArticleProcess } from '.';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { VaultStore } from '../../store/vault/vault.store';

export function reviewGetNextArticleProcess({
  vaultStore,
  exerciseStore,
}: {
  vaultStore: VaultStore;
  exerciseStore: ExerciseStore;
}): ReviewGetNextArticleProcess {
  return () => {
    const todayNew = exerciseStore.todayNew()[0];
    if (todayNew && vaultStore.article(todayNew)()) return todayNew;

    const todayRepeat = exerciseStore.todayRepeat()[0];
    if (todayRepeat && vaultStore.article(todayRepeat)()) return todayRepeat;

    const todayConsolidate = exerciseStore.todayConsolidate()[0];
    if (todayConsolidate && vaultStore.article(todayConsolidate)()) return todayConsolidate;

    return null;
  };
}
