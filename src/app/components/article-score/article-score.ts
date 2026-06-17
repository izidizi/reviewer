import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-article-score',
  imports: [MatIconModule],
  styles: [``],
  template: `<mat-icon class="material-icons-outlined">{{ scoreIcon() }}</mat-icon>`,
})
export class AppArticleScoreComponent {
  readonly score = input<number | null | undefined>(null);
  readonly scoreIcon = computed(() => {
    const score = this.score();
    if (score == null) return 'highlight_off';
    if (score < 2) return 'looks_one';
    if (score < 3) return 'looks_two';
    if (score < 4) return 'looks_3';
    if (score < 4.8) return 'looks_4';
    return 'looks_5';
  });
}
