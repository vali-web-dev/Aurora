'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const EXCLUDED_PATHS = new Set(['/']);
const ALLOWED_INPUT_TYPES = new Set([
  'text',
  'email',
  'password',
  'search',
  'tel',
  'url',
  'number',
]);

function isTextInput(element: Element): element is HTMLInputElement | HTMLTextAreaElement | HTMLElement {
  if (element instanceof HTMLTextAreaElement) return true;
  if (element instanceof HTMLInputElement) {
    const type = (element.type || 'text').toLowerCase();
    return ALLOWED_INPUT_TYPES.has(type);
  }
  if (element instanceof HTMLElement) {
    return element.getAttribute('contenteditable') === 'true';
  }
  return false;
}

function isFocusableCandidate(element: Element) {
  if (!(element instanceof HTMLElement)) return false;
  if (element.hasAttribute('disabled')) return false;
  if (element.getAttribute('aria-hidden') === 'true') return false;
  if (element.getAttribute('data-no-autofocus') === 'true') return false;
  if (element.getAttribute('data-autofocus') === 'false') return false;

  const style = window.getComputedStyle(element);
  if (style.visibility === 'hidden' || style.display === 'none') return false;
  if (element.offsetParent === null && style.position !== 'fixed') return false;

  return true;
}

function hasDialogOpen() {
  return Boolean(document.querySelector('[role="dialog"][aria-modal="true"]'));
}

function hasActiveTextInput() {
  const active = document.activeElement;
  if (!active || !(active instanceof HTMLElement)) return false;
  if (active instanceof HTMLTextAreaElement) return true;
  if (active instanceof HTMLInputElement) return true;
  if (active.getAttribute('contenteditable') === 'true') return true;
  return false;
}

function focusFirstTextInput() {
  if (hasDialogOpen() || hasActiveTextInput()) return false;

  const preferred = Array.from(
    document.querySelectorAll('[data-autofocus="true"]')
  ).filter((element) => isTextInput(element) && isFocusableCandidate(element));

  const candidates = Array.from(
    document.querySelectorAll('input, textarea, [contenteditable="true"]')
  ).filter((element) => isTextInput(element) && isFocusableCandidate(element));

  const target = (preferred[0] || candidates[0]) as HTMLElement | undefined;
  if (!target) return false;

  target.focus({ preventScroll: true });
  return document.activeElement === target;
}

export function AutoFocusManager() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || EXCLUDED_PATHS.has(pathname)) return;

    let didFocus = false;
    const attempt = () => {
      if (!didFocus) {
        didFocus = focusFirstTextInput();
      }
      return didFocus;
    };

    const timeoutId = setTimeout(() => {
      attempt();
    }, 0);

    const observer = new MutationObserver(() => {
      if (attempt()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const stopId = setTimeout(() => {
      observer.disconnect();
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(stopId);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
