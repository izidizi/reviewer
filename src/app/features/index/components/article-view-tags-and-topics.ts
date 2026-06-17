import { Component, computed, input } from '@angular/core';
import { AppTagComponent } from '../../../components/tag/tag';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-article-view-tags-and-topics',
  imports: [MatIconModule, AppTagComponent],
  styles: `
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .empty-state {
      color: var(--mat-sys-on-surface-variant);
      font-style: italic;
      margin: 1rem 0 0 0;
    }
  `,
  template: `
    <div class="section-title">
      <mat-icon class="material-icons-outlined">{{ showTags() ? 'label' : 'topic' }}</mat-icon>
      <span>{{ showTags() ? 'Tags' : 'Topics' }}</span>
    </div>
    <div class="tags-container">
      @if (hasItems()) {
        @for (item of items(); track item) {
          @if (showTags()) {
            <app-tag [tag]="item" />
          } @else {
            <app-tag [topic]="item" />
          }
        }
      } @else {
        <p class="empty-state">{{ showTags() ? 'no tags' : 'no topics' }}</p>
      }
    </div>
  `,
})
export class ArticleViewTagsAndTopics {
  readonly display = input.required<'tag' | 'topic'>();
  readonly showTags = computed(() => this.display() === 'tag');
  readonly items = input.required<string[]>();
  readonly hasItems = computed(() => this.items().length > 0);
}
