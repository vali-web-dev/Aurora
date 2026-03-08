'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { flattenedNavigation } from '@/lib/expandable-navigation';
import { AuroraModal } from '@/components/aurora/Modal';
import { Badge } from '@/components/aurora/Badge';
import { PageIcon, getPageIconColor, resolvePageIconName } from '@/components/aurora/PageIcons';

interface SearchItem {
  href: string;
  label: string;
  group: 'Primary' | 'Explore' | 'Support';
  description?: string;
}

// Use the comprehensive flattened navigation
const searchItems: SearchItem[] = flattenedNavigation.map((item) => ({
  href: item.href,
  label: item.label,
  group: item.group || 'Explore',
  description: item.description,
}));

interface GlobalSearchProps {
  onOpenChange?: (open: boolean) => void;
  externalOpen?: boolean;
  triggerMode?: 'button' | 'input' | 'none';
  className?: string;
  placeholder?: string;
}

export function GlobalSearch({
  onOpenChange,
  externalOpen,
  triggerMode = 'button',
  className,
  placeholder = 'Search Aurora',
}: GlobalSearchProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [inlineOpen, setInlineOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimerRef = useRef<number | null>(null);
  const dialogId = useId();

  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = useCallback(
    (open: boolean) => {
      if (onOpenChange) {
        onOpenChange(open);
      } else {
        setInternalOpen(open);
      }
    },
    [onOpenChange]
  );

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return searchItems;
    return searchItems.filter((item) => item.label.toLowerCase().includes(trimmed));
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  }, [pathname, isOpen, setIsOpen]);

  useEffect(() => {
    if (inlineOpen) {
      setInlineOpen(false);
    }
  }, [pathname, inlineOpen]);

  useEffect(() => {
    return () => {
      if (blurTimerRef.current !== null) {
        window.clearTimeout(blurTimerRef.current);
      }
    };
  }, []);

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
  }, [isOpen, setIsOpen]);

  const handleSelect = useCallback(
    (href: string) => {
      setIsOpen(false);
      setInlineOpen(false);
      router.push(href);
    },
    [router, setIsOpen, setInlineOpen]
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
      if (event.key === 'Escape') {
        event.preventDefault();
        setInlineOpen(false);
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        const selected = results[activeIndex] || results[0];
        if (selected) {
          handleSelect(selected.href);
        }
      }
    },
    [results, activeIndex, handleSelect]
  );

  return (
    <div className={clsx('relative', className)}>
      {triggerMode === 'input' && (
        <div className="relative w-full">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setInlineOpen(true)}
            onClick={() => setInlineOpen(true)}
            onBlur={() => {
              if (blurTimerRef.current !== null) {
                window.clearTimeout(blurTimerRef.current);
              }
              blurTimerRef.current = window.setTimeout(() => {
                setInlineOpen(false);
              }, 120);
            }}
            placeholder={placeholder}
            className={clsx(
              'aurora-label h-11 w-full rounded-lg border pl-3 pr-10 text-sm',
              'bg-white/90 dark:bg-slate-900/70',
              'border-slate-200 dark:border-slate-800',
              'aurora-label text-slate-700 dark:text-slate-200',
              'placeholder:opacity-70',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/40'
            )}
            aria-label="Search"
            aria-controls="global-search-inline-results"
          />
          <span className="aurora-label pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </span>
          {inlineOpen && (
            <div
              id="global-search-inline-results"
              className={clsx(
                'absolute left-0 right-0 top-full z-40 mt-2 max-h-72 overflow-y-auto rounded-xl',
                'border border-slate-200 bg-white shadow-xl',
                'dark:border-slate-800 dark:bg-slate-950'
              )}
              role="listbox"
              aria-label="Search results"
            >
              {results.length === 0 ? (
                <div className="aurora-label px-4 py-3 text-sm text-slate-500">
                  No results found.
                </div>
              ) : (
                results.map((item, index) => {
                  const iconName = resolvePageIconName(item.label, item.href);
                  return (
                  <button
                    key={`${item.group}-${item.href}-${index}`}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelect(item.href)}
                    className={clsx(
                      'aurora-label flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm',
                      index === activeIndex
                        ? 'aurora-label bg-blue-600 text-white'
                        : 'aurora-label text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900'
                    )}
                    role="option"
                    aria-selected={index === activeIndex}
                  >
                    <span
                      className={clsx('aurora-label inline-flex h-4 w-4 flex-shrink-0 items-center justify-center mt-0.5', index === activeIndex ? 'text-white' : getPageIconColor(iconName))}
                      aria-hidden="true"
                    >
                      <PageIcon pageName={iconName} className="w-full h-full" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.label}</div>
                      {item.description && (
                        <div className={clsx('aurora-label text-xs truncate', index === activeIndex ? 'text-white/80' : 'text-slate-500 dark:text-slate-400')}>
                          {item.description}
                        </div>
                      )}
                    </div>
                    <span className={clsx('aurora-label flex-shrink-0', index === activeIndex ? 'text-white/70' : 'text-slate-400')}>
                      {item.group}
                    </span>
                  </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {triggerMode === 'button' && (
        <>
          <button
            onClick={() => setIsOpen(true)}
            className={clsx(
              'aurora-label hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg',
              'text-sm font-medium transition-all duration-200',
              'aurora-label text-slate-600 dark:text-slate-300',
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
            <span className="aurora-label text-xs text-slate-400">Ctrl K</span>
          </button>

          <button
            onClick={() => setIsOpen(true)}
            className={clsx(
              'aurora-label md:hidden w-10 h-10 rounded-lg flex items-center justify-center',
              'aurora-label text-slate-600 dark:text-slate-300',
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
        </>
      )}

      {triggerMode === 'button' && (
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
                'aurora-label w-full bg-transparent text-slate-900 dark:text-slate-50',
                'placeholder:opacity-70 outline-none text-lg'
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
              <div className="aurora-label px-2 py-6 text-sm text-slate-500">
                No results found.
              </div>
            )}
            <div className="space-y-2" role="listbox" aria-label="Search results">
              {results.map((item, index) => {
                const iconName = resolvePageIconName(item.label, item.href);
                return (
                <button
                  key={`${item.group}-${item.href}-${index}`}
                  id={`${dialogId}-option-${index}`}
                  onClick={() => handleSelect(item.href)}
                  className={clsx(
                    'aurora-label w-full flex items-start gap-3 px-4 py-3 rounded-lg text-left',
                    'transition-colors',
                    index === activeIndex
                      ? 'aurora-label bg-blue-600 text-white'
                      : 'aurora-label text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                  role="option"
                  aria-selected={index === activeIndex}
                >
                  <span
                    className={clsx('aurora-label inline-flex h-5 w-5 flex-shrink-0 items-center justify-center mt-0.5', index === activeIndex ? 'text-white' : getPageIconColor(iconName))}
                    aria-hidden="true"
                  >
                    <PageIcon pageName={iconName} className="w-full h-full" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                      <div className={clsx('aurora-label text-sm truncate', index === activeIndex ? 'text-white/80' : 'text-slate-500 dark:text-slate-400')}>
                        {item.description}
                      </div>
                    )}
                  </div>
                  <Badge
                    size="sm"
                    variant={index === activeIndex ? 'primary' : 'default'}
                    className={index === activeIndex ? 'aurora-label bg-white/20 text-white flex-shrink-0' : 'flex-shrink-0'}
                  >
                    {item.group}
                  </Badge>
                </button>
                );
              })}
            </div>
          </div>
        </AuroraModal>
      )}
    </div>
  );
}
