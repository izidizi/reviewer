import { Component, computed, inject, input } from '@angular/core';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { toISO6801DateString } from '../../../model/utils/iso8601-string';

type DayView = {
  day: string;
  dayClass: string;
  totalReviewed: string;
  totalReviewedClass: string;
};

@Component({
  selector: 'app-month-statistics',
  imports: [],
  templateUrl: './month-statistics.html',
  styleUrl: './month-statistics.scss',
})
export class AppMonthStatisticsComponent {
  readonly statisticsStore = inject(StatisticsStore);

  readonly month = input.required<number>();

  readonly monthName = computed(() => {
    const month = this.month();
    return new Date((this.month() + 1).toString().padStart(2, '0').slice(-2)).toLocaleString('en', {
      month: 'short',
    });
  });

  readonly monthStatistics = computed(() => {
    const month = this.month();
    const monthString = (this.month() + 1).toString().padStart(2, '0').slice(-2);
    const dayStatistics = this.statisticsStore.days();

    const year = new Date().getFullYear();
    const currentDate = new Date(`${year}-${monthString}-01T00:00:00.000Z`);
    console.log({
      currentDate: `${year}-${monthString}-01T00:00:00.000Z`,
      asDate: new Date(currentDate),
    });
    const startDayOfWeek = currentDate.getDay();
    const result: (DayView | null)[] = Array(startDayOfWeek === 0 ? 6 : startDayOfWeek - 1).fill(
      null,
    );

    while (currentDate.getMonth() === month) {
      const date = toISO6801DateString(currentDate);
      const { reviews } = dayStatistics[date] ?? { date, reviews: [] };
      result.push({
        day: currentDate.getDate().toString().padStart(0).slice(-2),
        dayClass: '',
        totalReviewed: reviews.length.toString(),
        totalReviewedClass: '',
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  });
}
