import { Component, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ArticleId } from '../../../model/article-id';
import { DeleteArticleProcess } from '../../../processes/article';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-index-article-delete',
  imports: [MatIconModule, MatButtonModule],
  styles: ``,
  template: `
    <button matIconButton (click)="delete()">
      <mat-icon class="material-icons-outlined">delete</mat-icon>
    </button>
  `,
})
export class ArticleDeleteComponent {
  readonly articleId = input.required<ArticleId>();

  readonly notificationService = inject(NotificationService);
  readonly deleteProcess = inject(DeleteArticleProcess);

  delete(): void {
    this.deleteProcess(this.articleId());
  }
}
