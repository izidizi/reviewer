import { Component, computed, inject, input } from '@angular/core';
import { ArticleId } from '../../../model/article-id';
import { VaultIndexStore } from '../../../store/vault-index/vault-index.store';
import { AppTagComponent } from '../../../components/tag/tag';
import { ArticleMoveToComponent } from './move-to';

@Component({
  selector: 'app-index-article-details',
  imports: [AppTagComponent, ArticleMoveToComponent],
  styles: `
    :host {
      min-height: 0;
    }
  `,
  template: `details for {{ articleId() }}
    <p>
      tags:
      @for (tag of tags(); track $index) {
        <app-tag [tag]="tag" />
      }
    </p>
    <p>
      topics:
      @for (topic of topics(); track $index) {
        <app-tag [topic]="topic" />
      }
    </p>
    <app-index-article-move-to [articleId]="articleId()" /> `,
})
export class ArticleDetailsComponent {
  readonly vaultIndexStore = inject(VaultIndexStore);

  readonly articleId = input.required<ArticleId>();
  readonly tags = computed(() => {
    const article = this.vaultIndexStore.articles()[this.articleId()];
    return article?.tags ?? [];
  });
  readonly topics = computed(() => {
    const article = this.vaultIndexStore.articles()[this.articleId()];
    return article?.topics ?? [];
  });
}
