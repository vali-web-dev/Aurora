'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { primaryNav, secondaryNav, utilityNav } from '@/lib/navigation';
import { AuroraModal } from '@/components/aurora/Modal';
import { Badge } from '@/components/aurora/Badge';

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

interface GlobalSearchProps {
  onOpenChange?: (open: boolean) => void;
  externalOpen?: boolean;
}

export function GlobalSearch({ onOpenChange, externalOpen }: GlobalSearchProps = {}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogId = useId();

  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalOpen(open);
    }
  };

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return searchItems;
    return searchItems.filter((item) => item.label.toLowerCase().includes(trimmed));
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
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

  const handleSelect = useCallback(
    (href: string) => {
      setIsOpen(false);
      router.push(href);
    },
    [router]
  );

  const handleInputKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLInputElement>) => {
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
    },
    [results, activeIndex, handleSelect]
  );

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
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={dialogId}
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
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={dialogId}
      >
        S
      </button>

      <AuroraModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="md"
        id={dialogId}
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
            aria-activedescendant={
              results[activeIndex] ? `${dialogId}-option-${activeIndex}` : undefined
            }
          />
        }
      >
        <div className="max-h-[50vh] overflow-y-auto">
          {results.length === 0 && (
            <div className="px-2 py-6 text-sm text-slate-500">
              No results found.
            </div>
          )}
          <div className="space-y-2" role="listbox" aria-label="Search results">
            {results.map((item, index) => (
              <button
                key={`${item.group}-${item.href}`}
                id={`${dialogId}-option-${index}`}
                onClick={() => handleSelect(item.href)}
                className={clsx(
                  'w-full flex items-center justify-between px-4 py-3 rounded-lg text-left',
                  'transition-colors',
                  index === activeIndex
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
                role="option"
                aria-selected={index === activeIndex}
              >
                <span className="font-medium">{item.label}</span>
                <Badge
                  size="sm"
                  variant={index === activeIndex ? 'primary' : 'default'}
                  className={index === activeIndex ? 'bg-white/20 text-white' : ''}
                >
                  {item.group}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </AuroraModal>
    </div>
  );
}
