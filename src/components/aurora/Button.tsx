import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium leading-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        // Aurora signature button style - gradient with glow
        aurora: 'btn-aurora text-white shadow-2xl',
        // Aurora secondary - glassmorphic style
        auroraSecondary: 'btn-aurora-secondary text-white',
        // Aurora ghost - minimal style
        auroraGhost: 'btn-aurora-ghost text-white',
        // Traditional variants
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600 dark:hover:bg-blue-500 dark:focus-visible:ring-blue-500 rounded-lg duration-200',
        secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 focus-visible:ring-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:focus-visible:ring-slate-400 rounded-lg duration-200',
        accent: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500 dark:hover:bg-red-400 dark:focus-visible:ring-red-400 rounded-lg duration-200',
        outline: 'border-2 border-slate-300 text-slate-900 hover:bg-slate-50 focus-visible:ring-slate-600 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-400 rounded-lg duration-200',
        ghost: 'text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-600 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-400 rounded-lg duration-200',
      },
      size: {
        sm: 'h-8 px-3 text-sm btn-aurora-sm',
        md: 'h-10 px-4 text-base btn-aurora-md',
        lg: 'h-12 px-6 text-lg btn-aurora-lg',
      },
    },
    defaultVariants: {
      variant: 'aurora',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);

Button.displayName = 'Button';
