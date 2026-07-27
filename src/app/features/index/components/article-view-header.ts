import { Component, inject, input } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { logAction } from '../../../../services/debug-logger';
import { ParseArticleIdLogic } from '../../../process-bl';
import { ArticleId } from '../../../model/article-id';
import { Router } from '@angular/router';
import { FeatureIndexStore } from '../index.store';

@Component({
  selector: 'app-article-view-header',
  imports: [MatIconModule, MatButton],
  styles: `
    :host {
      display: block;
      padding: 1rem;
    }
    .header-content {
      display: flex;
      gap: 0.5rem;
      align-items: center;

      .exists mat-icon {
        position: relative;
        top: 3px;
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      .article-title {
        font-size: 1.5rem;
        font-weight: 500;
      }

      .actions {
        flex-grow: 1;
        text-align: right;
      }
    }
  `,
  template: `
    <div class="header-content">
      <div class="exists">
        <mat-icon class="material-icons-outlined">check_circle</mat-icon>
      </div>
      <div class="article-title">{{ articleId() }}</div>
      <div class="actions">
        <button type="button" matButton="tonal" (click)="open()">
          <mat-icon class="material-icons-outlined">rate_review</mat-icon> Review
        </button>
      </div>
    </div>
  `,
})
export class ArticleViewHeader {
  readonly articleId = input.required<ArticleId>();
  readonly isExists = input.required<boolean>();

  readonly router = inject(Router);
  readonly scroller = inject(ViewportScroller);
  readonly featureIndexStore = inject(FeatureIndexStore);

  readonly parseArticleId = inject(ParseArticleIdLogic);

  open() {
    this.featureIndexStore.setScroll(this.scroller.getScrollPosition());
    const articleId = this.articleId();
    logAction(`open article`, 'ArticleViewHeader', { entity: articleId });
    const { path, name } = this.parseArticleId(articleId);
    this.router.navigate([...path, name]);
  }
}
