'use client';

import { useEffect } from 'react';

const MOTION_READY_CLASS = 'aurora-motion-ready';
const IDLE_TIMEOUT_MS = 1500;
const FALLBACK_DELAY_MS = 600;

type IdleCallbackHandle = number;

type IdleCallback = (
  callback: (deadline: IdleDeadline) => void,
  options?: { timeout: number }
) => IdleCallbackHandle;

type IdleCancel = (handle: IdleCallbackHandle) => void;

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: IdleCallback;
  cancelIdleCallback?: IdleCancel;
};

export function MotionGate() {
  useEffect(() => {
    const html = document.documentElement;
    const windowWithIdle = window as WindowWithIdleCallback;
    let idleHandle: IdleCallbackHandle | null = null;
    let timeoutHandle: number | null = null;

    const enableMotion = () => {
      html.classList.add(MOTION_READY_CLASS);
    };

    if (typeof windowWithIdle.requestIdleCallback === 'function') {
      idleHandle = windowWithIdle.requestIdleCallback(enableMotion, {
        timeout: IDLE_TIMEOUT_MS,
      });
    } else {
      timeoutHandle = window.setTimeout(enableMotion, FALLBACK_DELAY_MS);
    }

    return () => {
      if (idleHandle !== null && typeof windowWithIdle.cancelIdleCallback === 'function') {
        windowWithIdle.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== null) {
        window.clearTimeout(timeoutHandle);
      }
    };
  }, []);

  return null;
}
