import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="aurora-label text-slate-900 dark:text-slate-50">
          {label}
        </label>
      )}
      <input
        className={cn(
          'aurora-label w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600',
          'aurora-label bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50',
          'placeholder:opacity-70',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="aurora-label text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="aurora-label text-slate-900 dark:text-slate-50">
          {label}
        </label>
      )}
      <select
        className={cn(
          'aurora-label w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600',
          'aurora-label bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="aurora-label text-slate-900 dark:text-slate-50">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'aurora-label w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600',
          'aurora-label bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50',
          'placeholder:opacity-70',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="aurora-label text-sm text-red-500">{error}</p>}
    </div>
  );
}
