import { DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor() {
    // primary color
    effect(() => {
      // const primaryColor = this.#primaryColor();
      // if (primaryColor && primaryColor !== '') {
      //   this.#document.body.style.setProperty('--theme-primary', primaryColor);
      // }
    });

    // color scheme
    effect(() => {
      // const colorScheme = this.#colorScheme();
      // const colorSchemeValue = colorScheme === 'auto' ? 'light dark' : colorScheme;
      // this.#document.body.style.setProperty('color-scheme', colorSchemeValue);
    });
  }

  readonly #document = inject(DOCUMENT);
  readonly #primaryColor = signal<string>('');
  readonly #colorScheme = signal<'auto' | 'light' | 'dark'>('light');

  get colorScheme() {
    return this.#colorScheme.asReadonly();
  }

  chooseTheme(name: string) {
    //TODO: find primary color by theme name
    this.#primaryColor.set('#ff0000');
  }

  toggleColorScheme() {
    const colorScheme = this.#colorScheme();
    if (colorScheme === 'auto') {
      this.#colorScheme.set('light');
    } else if (colorScheme === 'light') {
      this.#colorScheme.set('dark');
    } else {
      this.#colorScheme.set('auto');
    }
  }

  colorSchemeDark() {
    this.#colorScheme.set('dark');
  }
  colorSchemeLight() {
    this.#colorScheme.set('light');
  }
}
