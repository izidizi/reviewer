import { Component, computed, ElementRef, inject, input, signal, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ArticleId, toArticleId } from '../../../model/article-id';
import { VaultIndexStore } from '../../../store/vault-index/vault-index.store';
import { MoveArticleProcess } from '../../../processes/article';
import { NotificationService } from '../../../services/notification.service';
import { CreateArticleIdBL } from '../../../process-bl';

@Component({
  selector: 'app-index-article-move-to',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatAutocompleteTrigger,
    FormsModule,
    ReactiveFormsModule,
  ],
  styles: `
    form {
      width: 100%;
      display: flex;
      gap: 0.5rem;
      align-items: baseline;
    }
    mat-form-field {
      flex-grow: 1;
    }
  `,
  template: `
    <form>
      <mat-form-field>
        <mat-label>Move to</mat-label>
        <input
          #input
          type="text"
          matInput
          [formControl]="inputControl"
          [matAutocomplete]="auto"
          (input)="filter()"
          (focus)="filter()"
        />
        <mat-autocomplete #auto="matAutocomplete">
          @for (option of articles(); track option) {
            <mat-option [value]="option">{{ option }}</mat-option>
          }
        </mat-autocomplete>
      </mat-form-field>
      <button matIconButton (click)="move()">
        <mat-icon class="material-icons-outlined">save_as</mat-icon>
      </button>
    </form>
  `,
})
export class ArticleMoveToComponent {
  readonly createArticleId = inject(CreateArticleIdBL);
  readonly moveArticleProcess = inject(MoveArticleProcess);
  readonly notificationService = inject(NotificationService);

  readonly vaultIndexStore = inject(VaultIndexStore);

  readonly articleId = input.required<ArticleId>();

  readonly filterValue = signal<string>('');
  readonly articles = computed(() => {
    const filterValue = this.filterValue();
    const articles = Object.keys(this.vaultIndexStore.articles());

    return articles.filter((articleId) => articleId.includes(filterValue));
  });

  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  inputControl = new FormControl('');

  filter(): void {
    this.filterValue.set(this.input.nativeElement.value.toLowerCase());
  }

  move(): void {
    const to = this.input.nativeElement.value;

    const { result: toArticleId, error } = this.inputValidation(to, this.articleId());
    if (error || !toArticleId) {
      this.notificationService.showError(error ?? 'unknown error');
      return;
    }

    try {
      this.moveArticleProcess(this.articleId(), toArticleId);
      this.inputControl.setValue('');
    } catch (error) {
      this.notificationService.showError(error);
    }
  }

  inputValidation(value: string, articleId: ArticleId): { result?: ArticleId; error?: string } {
    try {
      const result = this.createArticleId(value);
      if (result === articleId) return { error: `can't move to the same destination` };
      return { result };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }
}
