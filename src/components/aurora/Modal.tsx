'use client';

import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import clsx from 'clsx';
import { announce } from '@/lib/a11y/announcer';

interface AuroraModalProps {
  isOpen: boolean;
  onClose: () => void;
  id?: string;
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
  id,
  title,
  description,
  headerContent,
  footerContent,
  size = 'md',
  children,
}: AuroraModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const lastActiveRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const getFocusableElements = () => {
    const container = dialogRef.current;
    if (!container) return [] as HTMLElement[];
    return Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
  };

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    announce(`${title ?? 'Dialog'} opened`);
    return () => announce(`${title ?? 'Dialog'} closed`);
  }, [isOpen, title]);

  useEffect(() => {
    if (!isOpen) return;
    lastActiveRef.current = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => {
      const focusable = getFocusableElements();
      const first = focusable[0];
      if (first) {
        first.focus();
      } else {
        dialogRef.current?.focus();
      }
    });
    return () => {
      lastActiveRef.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 top-[80px] z-50 flex items-start justify-center p-4 pt-8">
      <div
        className="absolute inset-0 bg-slate-950/60"
        onClick={onClose}
        role="presentation"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        id={id}
        ref={dialogRef}
        tabIndex={-1}
        className={clsx(
          'aurora-menu-panel relative w-full rounded-2xl overflow-hidden',
          'bg-white dark:bg-slate-950',
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
                      <h2
                        id={titleId}
                        className="aurora-label text-lg font-semibold text-slate-900 dark:text-slate-50"
                      >
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p
                        id={descriptionId}
                        className="aurora-label text-sm text-slate-500 dark:text-slate-400"
                      >
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
                  'aurora-label text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
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
          <div className="aurora-label px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
}
