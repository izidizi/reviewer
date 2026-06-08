import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

import Prism from 'prismjs';
(window as any).Prism = Prism;
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';

import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
});

(window as any).mermaid = mermaid;

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
