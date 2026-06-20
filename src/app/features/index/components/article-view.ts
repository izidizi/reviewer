import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ArticleId } from '../../../model/article-id';
import { ReviewResult } from '../../../model/review-result';
import { ArticleViewTagsAndTopics } from './article-view-tags-and-topics';
import { ArticleViewReviewStatistics } from './article-view-review-statistics';
import { VaultArticleStatistics } from '../../../model/vault-article-statistics';
import { ArticleViewInfo } from './article-view-info';
import { ArticleViewHeader } from './article-view-header';
import { AppArticleScoreBlockComponent } from '../../../components/article-score-block';
import { AppArticleLastResultBlockComponent } from '../../../components/article-review-result-block';

@Component({
  selector: 'app-article-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    ArticleViewTagsAndTopics,
    ArticleViewReviewStatistics,
    AppArticleScoreBlockComponent,
    AppArticleLastResultBlockComponent,
    ArticleViewInfo,
    ArticleViewHeader,
  ],
  templateUrl: './article-view.html',
  styleUrl: './article-view.scss',
})
export class ArticleView {
  readonly articleId = input.required<ArticleId>();
  readonly tags = input.required<string[]>();
  readonly topics = input.required<string[]>();
  readonly statistics = input.required<VaultArticleStatistics['total']>();
  readonly score = input.required<number | null>();
  readonly created = input.required<string>();
  readonly indexed = input.required<string>();
  readonly lastResult = input.required<ReviewResult | null>();
  readonly lastReview = input.required<string>();
  readonly daysWithoutReview = input.required<string>();

  readonly info = computed((): ReadonlyArray<{ icon: string; title: string; value: string }> => {
    return [
      { icon: 'calendar_today', title: 'Created', value: this.created() },
      { icon: 'schedule', title: 'Indexed', value: this.indexed() },
      { icon: 'rate_review', title: 'Last review', value: this.lastReview() },
      { icon: 'schedule', title: 'Days without review', value: this.daysWithoutReview() },
    ];
  });
}
