import { VaultArticleStatistics } from '../../../model/vault-article-statistics';

export function getOverallScore(statistics?: VaultArticleStatistics): {
  overallScore: string;
  overallScoreClass: string;
} {
  if (!statistics) return { overallScore: 'highlight_off', overallScoreClass: 'no-score' };

  if (
    statistics.lastResult === 'positive' &&
    statistics.total.positive > 3 * (statistics.total.negative + statistics.total.incomplete)
  )
    return { overallScore: 'thumb_up', overallScoreClass: 'awesome' };

  if (
    statistics.lastResult === 'positive' &&
    statistics.total.positive > statistics.total.negative + statistics.total.incomplete
  )
    return { overallScore: 'thumb_up', overallScoreClass: 'good' };

  if (statistics.total.positive > statistics.total.negative + statistics.total.incomplete)
    return { overallScore: 'warning_amber', overallScoreClass: 'good' };

  if (statistics.lastResult === 'positive')
    return { overallScore: 'warning_amber', overallScoreClass: 'normal' };

  return { overallScore: 'priority_high', overallScoreClass: 'bad' };
}
