import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

import { ExerciseStore } from '../../store/exercise/exercise.store';
import { MatCardModule } from '@angular/material/card';
import { logAction, logDebug } from '../../../services/debug-logger';
import { startDateValidator } from './start-date.validator';

const place = 'AppReviewConfigurationComponent';
@Component({
  selector: 'app-review-configuration',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
  ],
  styles: `
    mat-form-field {
      width: 30rem;
    }
  `,
  template: `
    <form [formGroup]="reviewConfigurationForm" (ngSubmit)="onReviewConfigurationSave()">
      <mat-card appearance="outlined">
        <mat-card-header>
          <mat-card-title>Review configuration</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <!-- startDate -->
          <mat-form-field appearance="outline">
            <mat-label>Review start date</mat-label>
            <input matInput formControlName="startDate" />
            @if (
              reviewConfigurationForm.get('startDate')?.hasError('required') &&
              reviewConfigurationForm.get('startDate')?.touched
            ) {
              <mat-error>The start date is required</mat-error>
            } @else if (
              reviewConfigurationForm.get('startDate')?.hasError('invalidDate') &&
              reviewConfigurationForm.get('startDate')?.touched
            ) {
              <mat-error>The value is not valid date</mat-error>
            }
          </mat-form-field>
          <!-- includeTags -->
          <mat-form-field appearance="outline">
            <mat-label>Include tags</mat-label>
            <input matInput formControlName="includeTags" />
          </mat-form-field>
          <!-- excludeTags -->
          <mat-form-field appearance="outline">
            <mat-label>Exclude tags</mat-label>
            <input matInput formControlName="excludeTags" />
          </mat-form-field>
          <!-- includeTopics -->
          <mat-form-field appearance="outline">
            <mat-label>Include topics</mat-label>
            <input matInput formControlName="includeTopics" />
          </mat-form-field>
          <!-- excludeTopics -->
          <mat-form-field appearance="outline">
            <mat-label>Exclude topics</mat-label>
            <input matInput formControlName="excludeTopics" />
          </mat-form-field>
          <!-- newArticlesPerDay -->
          <mat-form-field appearance="outline">
            <mat-label>New articles per day</mat-label>
            <mat-select formControlName="newArticlesPerDay">
              @for (item of articlesPerDay; track item) {
                <mat-option [value]="item">{{ item }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <!-- repeatTimes -->
          <mat-form-field appearance="outline">
            <mat-label>Repeat times</mat-label>
            <mat-select formControlName="repeatTimes">
              @for (item of repeats; track item) {
                <mat-option [value]="item">{{ item }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </mat-card-content>
        <mat-card-actions>
          <button
            type="submit"
            matButton
            [disabled]="reviewConfigurationForm.invalid || reviewConfigurationForm.pristine"
          >
            Save
          </button>
          <button
            type="button"
            matButton
            [disabled]="reviewConfigurationForm.pristine"
            (click)="onVaultConfigurationReset()"
          >
            Reset
          </button>
        </mat-card-actions>
      </mat-card>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppReviewConfigurationComponent {
  readonly exerciseStore = inject(ExerciseStore);

  readonly reviewConfigurationForm: FormGroup = inject(FormBuilder).group({
    startDate: new FormControl('', [Validators.required, startDateValidator]),
    includeTags: new FormControl(''),
    includeTopics: new FormControl(''),
    excludeTags: new FormControl(''),
    excludeTopics: new FormControl(''),
    newArticlesPerDay: new FormControl(3, Validators.required),
    repeatTimes: new FormControl(2, Validators.required),
  });
  readonly articlesPerDay = Array(5)
    .fill(null)
    .map((_, index) => index + 3);
  readonly repeats = Array(3)
    .fill(null)
    .map((_, index) => index + 2);

  readonly configurationFormEffect = effect(() => {
    if (!this.reviewConfigurationForm.pristine) return;
    this.resetForm();
  });

  onReviewConfigurationSave(): void {
    if (this.reviewConfigurationForm.valid) {
      logAction('save vault configuration form', place);
      const startDate = new Date(this.reviewConfigurationForm.get('startDate')?.value);
      this.exerciseStore.patchConfiguration({
        startDate,
        includeTags: this.reviewConfigurationForm.get('includeTags')?.value,
        includeTopics: this.reviewConfigurationForm.get('includeTopics')?.value,
        excludeTags: this.reviewConfigurationForm.get('excludeTags')?.value,
        excludeTopics: this.reviewConfigurationForm.get('excludeTopics')?.value,
        newArticlesPerDay: this.reviewConfigurationForm.get('newArticlesPerDay')?.value,
        repeatTimes: this.reviewConfigurationForm.get('repeatTimes')?.value,
      });

      this.resetForm();
    } else {
      logDebug(`${place} - onReviewConfigurationSave / form not valid`);
    }
  }

  onVaultConfigurationReset(): void {
    logAction('reset vault configuration form', place);
    this.resetForm();
  }

  resetForm() {
    this.reviewConfigurationForm.reset();

    const startDate = this.exerciseStore.startDate().toISOString().slice(0, 10);

    this.reviewConfigurationForm.patchValue({
      startDate,
      includeTags: this.exerciseStore.includeTags(),
      excludeTags: this.exerciseStore.excludeTags(),
      includeTopics: this.exerciseStore.includeTopics(),
      excludeTopics: this.exerciseStore.excludeTopics(),
      newArticlesPerDay: this.exerciseStore.newArticlesPerDay(),
      repeatTimes: this.exerciseStore.repeatTimes(),
    });
  }
}
