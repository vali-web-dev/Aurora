'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { primaryNav, secondaryNav, utilityNav } from '@/lib/navigation';
import { AuroraModal } from '@/components/aurora/Modal';

interface SearchItem {
  href: string;
  label: string;
  group: 'Primary' | 'Explore' | 'Support';
}

const searchItems: SearchItem[] = [
  ...primaryNav.map((item) => ({ ...item, group: 'Primary' as const })),
  ...secondaryNav.map((item) => ({ ...item, group: 'Explore' as const })),
  ...utilityNav.map((item) => ({ ...item, group: 'Support' as const })),
];

export function GlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return searchItems;
    return searchItems.filter((item) => item.label.toLowerCase().includes(trimmed));
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleSelect = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const selected = results[activeIndex];
      if (selected) {
        handleSelect(selected.href);
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className={clsx(
          'hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg',
          'text-sm font-medium transition-all duration-200',
          'text-slate-600 dark:text-slate-300',
          'bg-slate-100/70 dark:bg-slate-900/60',
          'border border-slate-200 dark:border-slate-800',
          'hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
        )}
        aria-label="Open search"
      >
        <span>Search</span>
        <span className="text-xs text-slate-400">Ctrl K</span>
      </button>

      <button
        onClick={() => setIsOpen(true)}
        className={clsx(
          'md:hidden w-10 h-10 rounded-lg flex items-center justify-center',
          'text-slate-600 dark:text-slate-300',
          'bg-slate-100/70 dark:bg-slate-900/60',
          'border border-slate-200 dark:border-slate-800',
          'hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
        )}
        aria-label="Open search"
      >
        S
      </button>

      <AuroraModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        footerContent="Tip: Use arrow keys to navigate, Enter to open."
        headerContent={
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search pages and universes"
            className={clsx(
              'w-full bg-transparent text-slate-900 dark:text-slate-50',
              'placeholder:text-slate-400 outline-none text-lg'
            )}
            aria-label="Search"
          />
        }
      >
        <div className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 && (
            <div className="px-2 py-6 text-sm text-slate-500">
              No results found.
            </div>
          )}
          <div className="space-y-2">
            {results.map((item, index) => (
              <button
                key={`${item.group}-${item.href}`}
                onClick={() => handleSelect(item.href)}
                className={clsx(
                  'w-full flex items-center justify-between px-4 py-3 rounded-lg text-left',
                  'transition-colors',
                  index === activeIndex
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <span className="font-medium">{item.label}</span>
                <span
                  className={clsx(
                    'text-xs px-2 py-1 rounded-full',
                    index === activeIndex
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  )}
                >
                  {item.group}
                </span>
              </button>
            ))}
          </div>
        </div>
      </AuroraModal>
    </div>
  );
}
