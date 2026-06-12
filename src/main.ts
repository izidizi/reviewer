// Prism
import Prism from 'prismjs';
(window as any).Prism = Prism;
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';

// mermaid
import mermaid from 'mermaid';
mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
});
(window as any).mermaid = mermaid;

// firebase
// import { initializeApp } from 'firebase/app';
// initializeApp({
//   apiKey: 'AIzaSyBh3LwhSlmE8NXxeb-xvfoqjl2tuIfqqA8',
//   authDomain: 'reviewer-2026.firebaseapp.com',
//   projectId: 'reviewer-2026',
//   storageBucket: 'reviewer-2026.firebasestorage.app',
//   messagingSenderId: '1008223341344',
//   appId: '1:1008223341344:web:26bef7f8201e2187162545',
// });

// app bootstrap
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
bootstrapApplication(App, appConfig).catch((err) => console.error(err));
