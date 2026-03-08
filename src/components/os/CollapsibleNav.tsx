'use client';

import { useState, useRef, useEffect, useId } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { secondaryNav, utilityNav } from '@/lib/navigation';
import { expandableNavigation } from '@/lib/expandable-navigation';
import { useTheme } from '@/lib/design-system/theme-provider';
import clsx from 'clsx';
import { announce } from '@/lib/a11y/announcer';
import { PageIcon, getPageIconColor, resolvePageIconName } from '@/components/aurora/PageIcons';

function isActive(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CollapsibleNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { mode } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const hasAnnouncedRef = useRef(false);
  const primaryItems = expandableNavigation.filter((item) => item.group === 'Primary');

  const isIlluminated = mode === 'illuminated';

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!hasAnnouncedRef.current) {
      hasAnnouncedRef.current = true;
      return;
    }
    announce(isOpen ? 'Navigation menu opened' : 'Navigation menu closed');
  }, [isOpen]);

  return (
    <div className="relative md:hidden">
      {/* Hamburger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'aurora-label relative w-10 h-10 flex items-center justify-center rounded-lg',
          'transition-all duration-300 ease-out',
          'border border-slate-200 dark:border-slate-800',
          isOpen
            ? 'aurora-label bg-blue-600 text-white shadow-lg hover:border-blue-400 dark:hover:border-blue-600'
            : 'aurora-label text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
          isIlluminated && isOpen && 'shadow-[0_0_20px_rgba(59,130,246,0.6)]'
        )}
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={panelId}
      >
        <div className="flex flex-col gap-1.5">
          <span
            className={clsx(
              'block h-0.5 w-5 bg-current transition-all duration-300',
              isOpen && 'rotate-45 translate-y-2'
            )}
          />
          <span
            className={clsx(
              'block h-0.5 w-5 bg-current transition-all duration-300',
              isOpen && 'opacity-0'
            )}
          />
          <span
            className={clsx(
              'block h-0.5 w-5 bg-current transition-all duration-300',
              isOpen && '-rotate-45 -translate-y-2'
            )}
          />
        </div>
      </button>

      {/* Dropdown Menu - Animated Slide Down */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className={clsx(
              'fixed inset-0 top-[80px] z-40 bg-black/0 md:hidden',
              'animate-fade-in duration-200'
            )}
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div
            ref={panelRef}
            id={panelId}
            className={clsx(
              'aurora-menu-panel aurora-menu-panel--clear absolute top-full right-0 mt-2 w-[min(18rem,calc(100vw-1.5rem))] rounded-xl border',
              'border-slate-200 dark:border-slate-800',
              'shadow-xl dark:shadow-2xl',
              'z-[9999] overflow-hidden',
              'animate-slide-in-down duration-300'
            )}
          >
            {/* Primary Navigation Section */}
            <div className="border-b border-slate-100 dark:border-slate-800">
              <div className="px-2 py-3">
                <p className="aurora-label mb-2 px-3 text-slate-500 dark:text-slate-500">
                  Primary
                </p>
                <div className="space-y-1">
                  {primaryItems.map((item, index) => {
                    const iconName = resolvePageIconName(item.label, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={clsx(
                          'aurora-label block rounded-lg px-3 py-2 text-sm font-medium',
                          'transition-all duration-200',
                          isActive(pathname, item.href)
                            ? clsx(
                                'aurora-label bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-100',
                                isIlluminated && 'shadow-[inset_0_0_20px_rgba(99,102,241,0.3)]'
                              )
                            : 'aurora-label text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
                          'hover:translate-x-1',
                          isIlluminated && 'hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                        )}
                        style={{
                          transitionDelay: `${index * 20}ms`
                        }}
                      >
                        <span className="inline-flex items-center gap-2">
                          <span className={clsx('inline-flex h-4 w-4', getPageIconColor(iconName))} aria-hidden="true">
                            <PageIcon pageName={iconName} className="h-4 w-4" />
                          </span>
                          <span>{item.label}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Secondary Navigation Section */}
            <div className="border-b border-slate-100 dark:border-slate-800">
              <div className="px-2 py-3">
                <p className="aurora-label px-3 text-slate-500 dark:text-slate-500 mb-2">
                  Explore
                </p>
                <div className="space-y-1">
                  {secondaryNav.map((item, index) => {
                    const iconName = resolvePageIconName(item.label, item.href);
                    return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={clsx(
                        'aurora-label block px-3 py-2 rounded-lg text-sm font-medium',
                        'transition-all duration-200',
                        isActive(pathname, item.href)
                          ? clsx(
                              'aurora-label bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100',
                              isIlluminated && 'shadow-[inset_0_0_20px_rgba(59,130,246,0.3)]'
                            )
                          : 'aurora-label text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
                        'hover:translate-x-1',
                        isIlluminated && 'hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                      )}
                      style={{
                          transitionDelay: `${(primaryItems.length + index) * 20}ms`
                      }}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className={clsx('inline-flex h-4 w-4', getPageIconColor(iconName))} aria-hidden="true">
                          <PageIcon pageName={iconName} className="h-4 w-4" />
                        </span>
                        <span>{item.label}</span>
                      </span>
                    </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Utility Navigation Section */}
            <div className="px-2 py-3">
              <p className="aurora-label px-3 text-slate-500 dark:text-slate-500 mb-2">
                Support
              </p>
              <div className="space-y-1">
                {utilityNav.map((item, index) => {
                  const iconName = resolvePageIconName(item.label, item.href);
                  return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={clsx(
                      'aurora-label block px-3 py-2 rounded-lg text-sm font-medium',
                      'transition-all duration-200',
                      isActive(pathname, item.href)
                        ? clsx(
                            'aurora-label bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-100',
                            isIlluminated && 'shadow-[inset_0_0_20px_rgba(16,185,129,0.3)]'
                          )
                        : 'aurora-label text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
                      'hover:translate-x-1',
                      isIlluminated && 'hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    )}
                    style={{
                      transitionDelay: `${(primaryItems.length + secondaryNav.length + index) * 20}ms`
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className={clsx('inline-flex h-4 w-4', getPageIconColor(iconName))} aria-hidden="true">
                        <PageIcon pageName={iconName} className="h-4 w-4" />
                      </span>
                      <span>{item.label}</span>
                    </span>
                  </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
