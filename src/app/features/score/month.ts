import { Component, computed, inject, input } from '@angular/core';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { toISO6801DateString } from '../../../model/utils/iso8601-string';
import { isToday } from '../../helpers';
import { ExerciseStore } from '../../store/exercise/exercise.store';

type DayView = {
  day: string;
  dayClass: string;
  totalReviewed: string;
  totalReviewedClass: string;
  futureDay: boolean;
};

@Component({
  selector: 'app-month-statistics',
  template: `
    <h3>{{ monthName() }}</h3>
    <div class="month">
      @for (day of monthStatistics(); track $index) {
        <div class="day {{ day?.dayClass ?? '' }} {{ day?.totalReviewedClass ?? '' }}">
          @if (day) {
            {{ day.futureDay === false ? day.totalReviewed : '&nbsp;' }}
          } @else {
            &nbsp;
          }
        </div>
      }
    </div>
  `,
  imports: [],
})
export class AppMothStatisticsComponent {
  readonly exerciseStore = inject(ExerciseStore);
  readonly statisticsStore = inject(StatisticsStore);

  readonly month = input.required<Date>();

  readonly monthName = computed(() => {
    const month = this.month();
    return month.toLocaleString('en', {
      month: 'short',
    });
  });

  readonly monthStatistics = computed(() => {
    const month = this.month().getMonth();
    const dayStatistics = this.statisticsStore.days();
    const { startDate, newArticlesPerDay } = this.exerciseStore.configuration();

    const currentDate = new Date(this.month().getTime() + 3 * 60 * 60 * 1000);
    const startDayOfWeek = currentDate.getDay();
    const result: (DayView | null)[] = Array(startDayOfWeek === 0 ? 6 : startDayOfWeek - 1).fill(
      null,
    );

    while (currentDate.getMonth() === month) {
      const date = toISO6801DateString(currentDate);
      const insideCurrentReviewPerion = currentDate >= startDate && currentDate < new Date();
      const { reviews } = dayStatistics[date] ?? { date, reviews: [] };
      const dayClass: string[] = [];
      const totalReviewedClass: string[] = [];

      if (isToday(currentDate)) dayClass.push('today');
      if (currentDate >= startDate) dayClass.push('work-day');
      if (reviews.length < newArticlesPerDay && insideCurrentReviewPerion) {
        totalReviewedClass.push('reviewed-bad');
      } else if (reviews.length < 2 * newArticlesPerDay && insideCurrentReviewPerion) {
        totalReviewedClass.push('reviewed-normal');
      } else if (reviews.length < 3 * newArticlesPerDay && insideCurrentReviewPerion) {
        totalReviewedClass.push('reviewed-good');
      } else if (insideCurrentReviewPerion) {
        totalReviewedClass.push('reviewed-awesome');
      }

      result.push({
        day: currentDate.getDate().toString().padStart(0).slice(-2),
        dayClass: dayClass.join(' '),
        totalReviewed: reviews.length.toString(),
        totalReviewedClass: totalReviewedClass.join(''),
        futureDay: currentDate > new Date(),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  });
}
