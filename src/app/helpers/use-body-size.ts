import { DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export function useBodySize() {
  const size = signal({ width: 0, height: 0 });
  const platformId = inject(PLATFORM_ID);
  const document = inject(DOCUMENT);

  if (isPlatformBrowser(platformId)) {
    const body = document.body;

    size.set({ width: body.clientWidth, height: body.clientHeight });

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;

      const { clientWidth, clientHeight } = body;
      size.set({ width: clientWidth, height: clientHeight });
    });

    resizeObserver.observe(body);

    inject(DestroyRef).onDestroy(() => {
      resizeObserver.disconnect();
    });
  }

  return size.asReadonly();
}
