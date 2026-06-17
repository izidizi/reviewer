import { InvalidDate } from '../../model/utils';
import { isValidDate } from '../../model/utils/invalid-date';

export function formatDate(date?: Date | InvalidDate | null): string {
  if (!date || !isValidDate(date)) return '--';
  return date.toLocaleString('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
