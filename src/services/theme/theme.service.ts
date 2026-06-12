import { computed, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor() {
    const matcher = window.matchMedia('(prefers-color-scheme: dark)');

    this.#systemColorScheme.set(matcher.matches ? 'dark' : 'light');

    matcher.addEventListener('change', (event) => {
      this.#systemColorScheme.set(matcher.matches ? 'dark' : 'light');
      const newTheme = event.matches ? 'dark' : 'light';
      console.log(`Системная тема изменилась на: ${newTheme}`);
    });
  }

  readonly #document = inject(DOCUMENT);
  readonly #primaryColor = signal<string>('');
  readonly #colorScheme = signal<'auto' | 'light' | 'dark'>('auto');
  readonly #systemColorScheme = signal<'light' | 'dark'>('light');

  readonly colorScheme = computed(() => {
    const colorScheme = this.#colorScheme();
    const systemColorScheme = this.#systemColorScheme();

    return colorScheme === 'auto' ? systemColorScheme : colorScheme;
  });

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

  // primary color
  #primaryColorEffect = effect(() => {
    const primaryColor = this.#primaryColor();
    if (primaryColor && primaryColor !== '') {
      this.#document.body.style.setProperty('--theme-primary', primaryColor);
    }
  });

  // color scheme
  #colorSchemeEffect = effect(() => {
    const colorScheme = this.#colorScheme();
    const colorSchemeValue = colorScheme === 'auto' ? 'light dark' : colorScheme;
    this.#document.body.style.setProperty('color-scheme', colorSchemeValue);
  });
}
