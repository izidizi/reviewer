import { Component, effect, inject, OnInit, resource, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MarkdownComponent } from 'ngx-markdown';
import { AuthStore } from './store/auth/auth.store';
import { LoginProcess } from './processes/login.process';
import { AppLoginComponent } from './features/login/login';
import { LoadConfigurationProcess } from './processes/load-configuration.process';
import { ConfigurationStore } from './store/configuration/configuration.store';
import { VaultIndexStore } from './store/vault-index/vault-index.store';
import { StatisticsStore } from './store/statistics/statistics.store';
import { IndexVaultProcess } from './processes/index-vault.process';
import { SaveConfigufationProcess } from './processes/save-configuration.process';
import { DriveApiService } from '../services';
import { GetFileCapabilitiesProcess } from './processes/get-file-capabilities';
import { ExerciseStore } from './store/exercise/exercise.store';
import { CreateTodaysPlan } from './processes/create-todays-plan';
import { ArticleId, getArticleId } from './model/article-id';
import { ReviewResult } from './model/review-result';
import { ReviewProcess } from './processes/review';
import { ReviewGetNextArticleProcess } from './processes/review-get-next-article';
import { AppTodayStatisticsComponent } from './features/today-statistics/today-statistics';
import { AppArticlesIndexComponent } from './features/articles-index/articles-index';
import { GetArticleContentProcess, MoveArticleProcess } from './processes/article';
import { AppMonthStatisticsComponent } from './features/month-statistics/month-statistics';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MarkdownComponent,
    AppLoginComponent,
    AppTodayStatisticsComponent,
    AppArticlesIndexComponent,
    AppMonthStatisticsComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  readonly loginProcess = inject(LoginProcess);
  readonly loadConfigurationProcess = inject(LoadConfigurationProcess);
  readonly indexVaultProcess = inject(IndexVaultProcess);
  readonly saveConfigurationProcess = inject(SaveConfigufationProcess);
  readonly getFileCapabilities = inject(GetFileCapabilitiesProcess);
  readonly createTodaysPlan = inject(CreateTodaysPlan);
  readonly getArticleContentProcess = inject(GetArticleContentProcess);
  readonly reviewProcess = inject(ReviewProcess);
  readonly reviewGetNextArticleProcess = inject(ReviewGetNextArticleProcess);
  readonly moveArticleProcess = inject(MoveArticleProcess);

  readonly state = inject(AuthStore);
  readonly configurationStore = inject(ConfigurationStore);
  readonly vaultIndexStore = inject(VaultIndexStore);
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

  tt = effect(() => {
    console.log('');
    console.log('--- new state');
    console.log('root path', this.configurationStore.configurationPath());
    console.log('root path driveId', this.configurationStore.configurationPathDriveId());
    console.log('configuration name', this.configurationStore.configurationName());
    console.log('configuration name driveId', this.configurationStore.configurationNameDriveId());
    console.log('path', this.configurationStore.path());
    console.log('vault index', this.vaultIndexStore.articles());
    console.log('exercise configuration startDate', this.exerciseStore.startDate());
    console.log('reviews', this.statisticsStore.reviews());
    console.log('article statistics', this.statisticsStore.articles());
    console.log('exercise statistics', this.statisticsStore.exercises());
    console.log('days statistics', this.statisticsStore.days());
  });

  loadConfiguration() {
    const rootPath = ['storage', 'it'];
    this.loadConfigurationProcess(rootPath, 'vault.zip');
  }

  indexVault() {
    this.indexVaultProcess();
  }

  save() {
    this.saveConfigurationProcess();
  }

  async test() {
    await this.createTodaysPlan();
    console.log(`today's plan: new`, this.exerciseStore.todayNew());
    console.log(`today's plan: repeat`, this.exerciseStore.todayRepeat());
    console.log(`today's plan: consolidate`, this.exerciseStore.todayConsolidate());

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
    this.moveArticleProcess(
      getArticleId('notes/http', 'html5.md'),
      getArticleId('notes/http', 'html5_.md'),
    );
  }

  positiveReview() {
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
}
