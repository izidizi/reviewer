export interface InvalidDate extends Date {}

export function parseDate(value: string | number | undefined | null): Date | InvalidDate {
  return value == null || value === '' ? new Date('') : new Date(value);
}
export function isValidDate(date: Date | InvalidDate): date is Date {
  return Number.isNaN(date.getTime()) === false;
}
