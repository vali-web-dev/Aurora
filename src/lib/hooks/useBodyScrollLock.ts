import { useEffect } from 'react';

declare global {
  interface Window {
    __auroraBodyScrollLockCount?: number;
    __auroraBodyScrollPrevOverflow?: string;
    __auroraBodyScrollPrevPaddingRight?: string;
  }
}

export function lockBodyScroll() {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const currentCount = window.__auroraBodyScrollLockCount ?? 0;
  if (currentCount === 0) {
    window.__auroraBodyScrollPrevOverflow = document.body.style.overflow;
    window.__auroraBodyScrollPrevPaddingRight = document.body.style.paddingRight;

    // Prevent layout shift when the scrollbar disappears during lock.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      const computedPaddingRight = Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = `${computedPaddingRight + scrollbarWidth}px`;
    }

    document.body.style.overflow = 'hidden';
  }

  window.__auroraBodyScrollLockCount = currentCount + 1;

  let released = false;

  return () => {
    if (released || typeof window === 'undefined') {
      return;
    }

    released = true;
    const nextCount = Math.max((window.__auroraBodyScrollLockCount ?? 1) - 1, 0);
    window.__auroraBodyScrollLockCount = nextCount;

    if (nextCount === 0) {
      document.body.style.overflow = window.__auroraBodyScrollPrevOverflow ?? '';
      document.body.style.paddingRight = window.__auroraBodyScrollPrevPaddingRight ?? '';
      window.__auroraBodyScrollPrevOverflow = undefined;
      window.__auroraBodyScrollPrevPaddingRight = undefined;
    }
  };
}

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) {
      return;
    }

    return lockBodyScroll();
  }, [active]);
}
