import { isValidDate } from './invalid-date';

type Year = `${number}${number}${number}${number}`;
type Month = `${number}${number}`;
type Day = `${number}${number}`;
type Hours = `${number}${number}`;
type Minutes = `${number}${number}`;
type Seconds = `${number}${number}`;
type MS = `${number}${number}${number}`;

declare const ISOStringBrand: unique symbol;

export type ISO8601String = `${Year}-${Month}-${Day}T${Hours}:${Minutes}:${Seconds}.${MS}Z` & {
  [ISOStringBrand]: true;
};
export type EmptyISO8601String = '' & {
  [ISOStringBrand]: true;
};

export function dateToISO80601String(date: Date): ISO8601String | EmptyISO8601String {
  if (isValidDate(date)) return date.toISOString() as ISO8601String;
  return '' as EmptyISO8601String;
}

export function isISO8601String(value: string): value is ISO8601String {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  if (date.toISOString() !== value) return false;

  return true;
}

declare const ISODateStringBrand: unique symbol;

export type ISO8601DateString = `${Year}-${Month}-${Day}` & { [ISODateStringBrand]: true };

export function toISO6801DateString(date: ISO8601String | Date): ISO8601DateString {
  return (typeof date === 'string' ? date : date.toISOString()).slice(0, 10) as ISO8601DateString;
}
