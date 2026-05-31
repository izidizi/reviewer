import { ReviewGetNextArticleProcess } from '.';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { VaultIndexStore } from '../../store/vault-index/vault-index.store';

export function reviewGetNextArticleProcess({
  vaultIndexStore,
  exerciseStore,
}: {
  vaultIndexStore: VaultIndexStore;
  exerciseStore: ExerciseStore;
}): ReviewGetNextArticleProcess {
  return () => {
    const todayNew = exerciseStore.todayNew()[0];
    if (todayNew && vaultIndexStore.articles()[todayNew]) return todayNew;

    const todayRepeat = exerciseStore.todayRepeat()[0];
    if (todayRepeat && vaultIndexStore.articles()[todayRepeat]) return todayRepeat;

    const todayConsolidate = exerciseStore.todayConsolidate()[0];
    if (todayConsolidate && vaultIndexStore.articles()[todayConsolidate]) return todayConsolidate;

    return null;
  };
}
