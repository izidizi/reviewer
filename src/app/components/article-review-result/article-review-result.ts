import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ReviewResult } from '../../model/review-result';

@Component({
  selector: 'app-article-review-result',
  imports: [MatIconModule],
  styles: [``],
  template: `<mat-icon class="material-icons-outlined">{{ resultIcon() }}</mat-icon>`,
})
export class AppArticleReviewResultComponent {
  readonly result = input<ReviewResult | null | undefined>(null);
  readonly resultIcon = computed(() => {
    const result = this.result();
    if (result == null) return 'highlight_off';
    if (result === 'positive') return 'thumb_up';
    if (result === 'incomplete') return 'warning_amber';
    return 'priority_high';
  });
}
