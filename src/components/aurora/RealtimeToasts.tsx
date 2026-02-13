'use client';

import clsx from 'clsx';
import { useRealtime, type ToastTone } from '@/lib/realtime/realtime-provider';

const toneStyles: Record<ToastTone, string> = {
  info: 'bg-blue-600 text-white',
  success: 'bg-emerald-600 text-white',
  warning: 'bg-amber-500 text-white',
  error: 'bg-rose-600 text-white',
};

export function RealtimeToasts() {
  const { toasts, removeToast } = useRealtime();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className={clsx(
            'w-[320px] rounded-xl shadow-2xl overflow-hidden',
            'border border-white/10 backdrop-blur-xl',
            toneStyles[toast.tone]
          )}
        >
          <div className="px-4 py-3 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.detail && (
                <p className="text-xs text-white/80">{toast.detail}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/70 hover:text-white text-xs"
              aria-label="Dismiss notification"
            >
              Close
            </button>
          </div>
          <div className="h-1 bg-white/20">
            <div className="h-full bg-white/60 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
