import { Component, inject } from '@angular/core';
import { StatisticsStore } from '../../store/statistics/statistics.store';

/**
 * @deprecated remove
 */
@Component({
  selector: 'app-today-statistics',
  imports: [],
  templateUrl: './today-statistics.html',
  styleUrl: './today-statistics.scss',
})
export class AppTodayStatisticsComponent {
  readonly statisticsStore = inject(StatisticsStore);
}
