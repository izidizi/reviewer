export function isString(
  value: string | null | undefined,
  { canBeNull, mustBeDefined }: { canBeNull: boolean; mustBeDefined: boolean } = {
    canBeNull: true,
    mustBeDefined: false,
  },
) {
  if (mustBeDefined && value === undefined) return false;
  if (canBeNull === false && value === null) return false;
  return value == null || typeof value === 'string';
}

export function isNotEmptyString(value: string | null | undefined) {
  return isString(value, { canBeNull: false, mustBeDefined: true }) && (value?.length ?? 0) > 0;
}
