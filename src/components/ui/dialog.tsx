'use client';

import React, { ReactNode, useEffect, useRef } from 'react';
import clsx from 'clsx';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

interface DialogContentProps {
  className?: string;
  children: ReactNode;
  titleId?: string;
  descriptionId?: string;
}

interface DialogHeaderProps {
  children: ReactNode;
  onClose?: () => void;
}

interface DialogTitleProps {
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && open) {
        onOpenChange(false);
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    lastActiveRef.current = document.activeElement as HTMLElement | null;
    return () => {
      lastActiveRef.current?.focus();
    };
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = () => {
    onOpenChange(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-x-0 bottom-0 top-[80px] z-50 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
        role="presentation"
      />
      {/* Dialog Content */}
      <div className="fixed inset-x-0 bottom-0 top-[80px] z-50 flex items-start justify-center p-4 pt-8">
        <div onClick={(e) => e.stopPropagation()}>{children}</div>
      </div>
    </>
  );
}

export function DialogContent({
  className = '',
  children,
  titleId,
  descriptionId,
}: DialogContentProps) {
  return (
    <div
      className={clsx(
        'bg-white dark:bg-slate-900',
        'rounded-lg shadow-xl',
        'border border-slate-200 dark:border-slate-800',
        'w-full max-w-2xl',
        'max-h-[80vh] overflow-y-auto',
        'p-6',
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      {children}
    </div>
  );
}

export function DialogHeader({
  children,
  onClose,
}: DialogHeaderProps) {
  return (
    <div className="mb-4 space-y-1 flex items-start justify-between gap-4">
      <div className="flex-1">{children}</div>
      {onClose && (
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
      )}
    </div>
  );
}

export function DialogTitle({ children }: DialogTitleProps) {
  return (
    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
      {children}
    </h2>
  );
}
