'use client';

import React, { ReactNode } from 'react';
import clsx from 'clsx';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

interface DialogContentProps {
  className?: string;
  children: ReactNode;
}

interface DialogHeaderProps {
  children: ReactNode;
}

interface DialogTitleProps {
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        role="presentation"
      />
      {/* Dialog Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div onClick={(e) => e.stopPropagation()}>{children}</div>
      </div>
    </>
  );
}

export function DialogContent({
  className = '',
  children,
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
    >
      {children}
    </div>
  );
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return <div className="mb-4 space-y-1">{children}</div>;
}

export function DialogTitle({ children }: DialogTitleProps) {
  return (
    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
      {children}
    </h2>
  );
}
