export const ReviewResultPositive = 'positive';
export const ReviewResultNegative = 'negative';
export const ReviewResultIncomplete = 'incomplete';
export const ReviewResultUnknown = 'unknown';

export type ReviewResult =
  | typeof ReviewResultPositive
  | typeof ReviewResultNegative
  | typeof ReviewResultIncomplete
  | typeof ReviewResultUnknown;

export function isReviewResult(result: string): result is ReviewResult {
  const list: ReviewResult[] = [
    ReviewResultPositive,
    ReviewResultIncomplete,
    ReviewResultNegative,
    ReviewResultUnknown,
  ];
  return list.includes(result as ReviewResult);
}
