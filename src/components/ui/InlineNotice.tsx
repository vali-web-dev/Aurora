import { cn } from '@/lib/utils';

type InlineNoticeProps = {
  message: string;
  tone?: 'success' | 'error' | 'info' | 'warning';
};

const toneStyles: Record<NonNullable<InlineNoticeProps['tone']>, string> = {
  success: 'aurora-label border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100',
  error: 'aurora-label border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100',
  info: 'aurora-label border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-100',
  warning: 'aurora-label border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100',
};

export function InlineNotice({ message, tone = 'info' }: InlineNoticeProps) {
  return (
    <div
      className={cn('aurora-label rounded-lg border px-4 py-3 text-sm', toneStyles[tone])}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
