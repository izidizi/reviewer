import { Component, computed, inject, input } from '@angular/core';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { toISO6801DateString } from '../../../model/utils/iso8601-string';
import { isToday } from '../../helpers';

type DayView = {
  day: string;
  dayClass: string;
  totalReviewed: string;
  totalReviewedClass: string;
};

@Component({
  selector: 'app-month-statistics',
  template: `
    <h3>{{ monthName() }}</h3>
    <div class="month">
      @for (day of monthStatistics(); track $index) {
        <div class="day {{ day?.dayClass ?? '' }}">
          @if (day) {
            {{ day.totalReviewed }}
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

    const currentDate = new Date(this.month().getTime());
    const startDayOfWeek = currentDate.getDay();
    const result: (DayView | null)[] = Array(startDayOfWeek === 0 ? 6 : startDayOfWeek - 1).fill(
      null,
    );

    while (currentDate.getMonth() === month) {
      const date = toISO6801DateString(currentDate);
      const { reviews } = dayStatistics[date] ?? { date, reviews: [] };
      const dayClass: string[] = [];
      if (isToday(currentDate)) dayClass.push('today');
      result.push({
        day: currentDate.getDate().toString().padStart(0).slice(-2),
        dayClass: dayClass.join(' '),
        totalReviewed: reviews.length.toString(),
        totalReviewedClass: '',
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  });
}
