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
    <div className="fixed inset-0 z-50 flex items-center sm:items-start justify-center p-4 sm:pt-24">
      <div
        className="absolute inset-0 bg-slate-950/40"
        onClick={onClose}
        role="presentation"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={clsx(
          'relative w-full rounded-2xl overflow-hidden',
          'bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl',
          'border border-slate-200 dark:border-slate-800',
          'shadow-2xl',
          'max-h-[90vh] flex flex-col',
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
                className={clsx(
                  'flex-shrink-0 w-8 h-8 rounded-lg',
                  'flex items-center justify-center',
                  'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
                  'hover:bg-slate-100 dark:hover:bg-slate-800',
                  'transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
                aria-label="Close dialog"
                title="Close (Esc)"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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
