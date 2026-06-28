import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';
import { AppLoginComponent } from '../login/login';
import { LoadConfigurationProcess } from '../../processes/load-configuration.process';
import { SaveConfigufationProcess } from '../../processes/save-configuration.process';
import { GetFileCapabilitiesProcess } from '../../processes/get-file-capabilities';
import { GetArticleContentProcess, MoveArticleProcess } from '../../processes/article';
import { ReviewProcess } from '../../processes/review';
import { ReviewGetNextArticleProcess } from '../../processes/review-get-next-article';
import { AuthStore } from '../../store/auth/auth.store';
import { ConfigurationStore } from '../../store/configuration/configuration.store';
import { StatisticsStore } from '../../store/statistics/statistics.store';
import { ExerciseStore } from '../../store/exercise/exercise.store';
import { DriveApiService } from '../../../services/drive-api';
import { ArticleId } from '../../model/article-id';
import { ReviewResult } from '../../model/review-result';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { logDebug } from '../../../services/debug-logger';
import { useBodySize } from '../../helpers';

@Component({
  selector: 'app-debug',
  imports: [MatButtonModule, MarkdownComponent, AppLoginComponent],
  templateUrl: './debug.html',
  styleUrl: './debug.scss',
})
export class AppDebugComponent implements OnInit {
  private router = inject(Router);

  readonly loadConfigurationProcess = inject(LoadConfigurationProcess);
  readonly saveConfigurationProcess = inject(SaveConfigufationProcess);
  readonly getFileCapabilities = inject(GetFileCapabilitiesProcess);
  readonly getArticleContentProcess = inject(GetArticleContentProcess);
  readonly reviewProcess = inject(ReviewProcess);
  readonly reviewGetNextArticleProcess = inject(ReviewGetNextArticleProcess);
  readonly moveArticleProcess = inject(MoveArticleProcess);

  readonly state = inject(AuthStore);
  readonly configurationStore = inject(ConfigurationStore);
  readonly statisticsStore = inject(StatisticsStore);
  readonly exerciseStore = inject(ExerciseStore);

  readonly driveApi = inject(DriveApiService);

  readonly articleId = signal<ArticleId | null>(null);
  readonly fileContent = signal<string>('### no configuration');
  // readonly fileContent = resource({
  //   params: () => ({ id: this.file() }),

  //   loader: async ({ params }) => {
  //     if (!params.id) {
  //       return '### no data';
  //     }

  //     const rootPath = ['storage', 'it'];
  //     try {
  //       const result = (await this.loadConfigurationProcess(rootPath, 'vault.zip')) ?? '';
  //       return '### ok';
  //     } catch (ex) {
  //       console.warn(ex);
  //       throw ex;
  //     }
  //   },
  //   defaultValue: '### no data',
  // });

  loadConfiguration() {
    const rootPath = ['storage', 'it'];
    this.loadConfigurationProcess(rootPath, 'vault.zip');
  }

  indexVault() {
    throw Error('no process');
  }

  save() {
    this.saveConfigurationProcess();
  }

  async test() {
    const articleId = this.reviewGetNextArticleProcess();
    this.articleId.set(articleId);

    if (articleId) {
      const content = await this.getArticleContentProcess(articleId);
      this.fileContent.set(content ?? '### no content');
    } else {
      this.fileContent.set('### no more articles to review');
    }
  }

  async testMove() {
    this.router.navigate(['theory', 'bottom and top types.md']);
    // this.router.navigate(['algorithm', 'exponential backoff.md']);
    // this.router.navigate(['angular', 'renessance.md']);
    // this.router.navigate(['angular', '$event.md']);
  }

  positiveReview() {
    logDebug('positive review', {
      entity: `articleId: [${this.articleId() ?? 'null'}]`,
      payload: { nodata: '' },
    });
    this.review('positive');
  }
  incompleteReview() {
    this.review('incomplete');
  }
  negativeReview() {
    this.review('negative');
  }
  async review(reviewResult: ReviewResult) {
    const articleId = this.articleId();
    if (!articleId) return;

    this.reviewProcess(articleId, reviewResult);

    const nextArticleId = this.reviewGetNextArticleProcess();
    this.articleId.set(nextArticleId);

    if (nextArticleId) {
      const content = await this.getArticleContentProcess(nextArticleId);
      this.fileContent.set(content ?? '### no content');
    } else {
      this.fileContent.set('### no more articles to review');
    }

    console.log(`today's plan: new`, this.exerciseStore.todayNew());
    console.log(`today's plan: repeat`, this.exerciseStore.todayRepeat());
    console.log(`today's plan: consolidate`, this.exerciseStore.todayConsolidate());
  }

  ngOnInit(): void {}

  readonly bodySize = useBodySize();
  readonly bodyWidth = computed(() => {
    const { width } = this.bodySize();
    return width;
  });
  readonly bodyHeight = computed(() => {
    const { height } = this.bodySize();
    return height;
  });

  reload() {
    const uri = globalThis.location.origin;
    globalThis.location.href = uri + '?t=' + new Date().getTime().toString();
  }
}
