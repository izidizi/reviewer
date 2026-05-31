export interface InvalidDate extends Date {}

export function isValidDate(date: Date | InvalidDate): date is Date {
  return Number.isNaN(date.getTime()) === false;
}
