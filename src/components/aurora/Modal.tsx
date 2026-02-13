'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import clsx from 'clsx';

interface AuroraModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
}

const sizeClass: Record<NonNullable<AuroraModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
  xl: 'max-w-4xl',
};

export function AuroraModal({
  isOpen,
  onClose,
  title,
  description,
  headerContent,
  footerContent,
  size = 'md',
  children,
}: AuroraModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-24">
      <div
        className="absolute inset-0 bg-slate-950/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={clsx(
          'relative w-full rounded-2xl overflow-hidden',
          'bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl',
          'border border-slate-200 dark:border-slate-800',
          'shadow-2xl',
          sizeClass[size]
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {(title || description || headerContent) && (
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                {headerContent ?? (
                  <div className="space-y-1">
                    {title && (
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {description}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label="Close dialog"
              >
                Close
              </button>
            </div>
          </div>
        )}
        <div className="max-h-[70vh] overflow-y-auto p-4">
          {children}
        </div>
        {footerContent && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
}
