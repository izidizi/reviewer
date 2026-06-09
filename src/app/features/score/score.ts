import { Component, computed, input } from '@angular/core';
import { AppMothStatisticsComponent } from './month';

@Component({
  selector: 'app-score',
  imports: [AppMothStatisticsComponent],
  templateUrl: './score.html',
  styleUrl: './score.scss',
})
export class AppScoreComponent {
  readonly numberOfMothes = input<number>(3);

  readonly displayedMonthes = computed(() => {
    const numberOfMothes = this.numberOfMothes();

    return Array(numberOfMothes)
      .fill(null)
      .map((_, index) => {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const targetMonth = new Date(startOfMonth.getTime() - 30 * 24 * 60 * 60 * 1000 * index);
        return new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
      })
      .reverse();
  });
}
