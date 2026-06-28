export function getFirstNRecords<T>(
  arr: readonly T[],
  numberOfRecords: number,
  compFn: (item: T) => boolean,
): T[] {
  const result: T[] = [];
  for (const item of arr) {
    if (compFn(item)) result.push(item);

    if (result.length >= numberOfRecords) break;
  }

  return result;
}
