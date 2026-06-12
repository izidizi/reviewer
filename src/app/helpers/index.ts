export { useBodySize } from './use-body-size';

export function isToday(date: Date | undefined | null) {
  const today = new Date();
  if (!date) return false;
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}
