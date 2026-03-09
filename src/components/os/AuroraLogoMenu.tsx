'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { expandableNavigation } from '@/lib/expandable-navigation';
import { PageIcon, getPageIconColor, resolvePageIconName } from '@/components/aurora/PageIcons';
import { AuroraLogo } from '@/components/aurora/AuroraLogo';
import { useTheme } from '@/lib/design-system/theme-provider';
import { useAuroraLogo } from '@/lib/brand/aurora-logo-provider';

/**
 * Aurora Logo Menu
 * Houses ALL main menu lists and submenu lists - the complete navigation system
 * Organized by: Primary, Explore, Support groups
 */
interface AuroraLogoMenuProps {
  onOpenChange?: (open: boolean) => void;
  forceCloseSignal?: number;
}

export function AuroraLogoMenu({ onOpenChange, forceCloseSignal = 0 }: AuroraLogoMenuProps = {}) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Primary']);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { mode } = useTheme();
  const { concept, setConcept } = useAuroraLogo();
  const isIlluminated = mode === 'illuminated';
  const menuId = useId();

  // Organize navigation by groups
  const groupedNav = {
    Primary: expandableNavigation.filter((item) => item.group === 'Primary'),
    Explore: expandableNavigation.filter((item) => item.group === 'Explore'),
    Support: expandableNavigation.filter((item) => item.group === 'Support'),
  };

  const groupIcons = {
    Primary: 'P',
    Explore: 'E',
    Support: 'S',
  } as const;

  const groupDescriptions = {
    Primary: 'Core universes and daily workflows',
    Explore: 'Discovery, expansion, and experiments',
    Support: 'Help, settings, and governance',
  } as const;

  useEffect(() => {
    setIsPanelOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      setIsPanelOpen(false);
    };

    if (!isPanelOpen) {
      return;
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPanelOpen]);

  useEffect(() => {
    onOpenChange?.(isPanelOpen);
  }, [isPanelOpen, onOpenChange]);

  useEffect(() => {
    setIsPanelOpen(false);
  }, [forceCloseSignal]);

  // Close menu on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPanelOpen) {
        setIsPanelOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isPanelOpen]);

  const closeMenu = () => {
    setIsPanelOpen(false);
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((g) => g !== groupName)
        : [...prev, groupName]
    );
  };

  const isRouteActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <div
        className="relative z-[9999]"
      >
        {/* Aurora Logo Button */}
        <button
          type="button"
          ref={triggerRef}
          onClick={() => {
            setIsPanelOpen((prev) => !prev);
          }}
          className={clsx(
            'relative inline-flex h-11 w-11 items-center justify-center rounded-xl overflow-hidden',
            'transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
            'hover:scale-105 hover:shadow-xl',
            'hover:shadow-[0_0_18px_rgba(0,217,255,0.35)]',
            isIlluminated && 'hover:shadow-[0_0_25px_rgba(139,92,246,0.6)]',
            isPanelOpen && 'scale-105 ring-2 ring-purple-400/40'
          )}
          aria-label="Aurora Navigation Menu"
          aria-haspopup="menu"
          aria-expanded={isPanelOpen}
          aria-controls={isPanelOpen ? menuId : undefined}
        >
        {/* Aurora Logo (Concept 1) */}
        <span className="relative z-10">
          <AuroraLogo concept={concept} size={32} interactive={false} showNav={false} />
        </span>
      </button>

      {/* Full Navigation Menu */}
      {isPanelOpen && (
        <div
          ref={menuRef}
          className={clsx(
            'aurora-menu-panel aurora-menu-panel--clear',
            'absolute left-0 top-12',
            'w-[440px] rounded-2xl shadow-2xl',
            'border border-slate-200/90 dark:border-slate-800/90',
            'max-h-[calc(100vh-100px)] overflow-y-auto',
            'animate-in fade-in slide-in-from-top-3 duration-300'
          )}
          style={{ zIndex: 9999 }}
          role="menu"
          id={menuId}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-slate-200 px-5 py-4 bg-white dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="aurora-heading-3">Aurora Universes</h2>
                <p className="aurora-label mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Navigate your digital civilization with structured realms
                </p>
              </div>
              <span className="aurora-label inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                Menu
              </span>
            </div>
            <div className="mt-3 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setConcept('core')}
                className={clsx(
                  'aurora-label rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                  concept === 'core'
                    ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-800 dark:text-blue-300'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                )}
              >
                Core Mark
              </button>
              <button
                type="button"
                onClick={() => setConcept('wave')}
                className={clsx(
                  'aurora-label rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                  concept === 'wave'
                    ? 'bg-white text-purple-700 shadow-sm dark:bg-slate-800 dark:text-purple-300'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                )}
              >
                Wave Mark
              </button>
            </div>
          </div>

          {/* Navigation Groups */}
          <div className="space-y-3 p-3.5">
            {Object.entries(groupedNav).map(([groupName, items]) => {
              if (items.length === 0) return null;
              const isExpanded = expandedGroups.includes(groupName);

              return (
                <section
                  key={groupName}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                >
                  {/* Group Header */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(groupName)}
                    className={clsx(
                      'aurora-label w-full px-3.5 py-3 transition-all duration-200',
                      'flex items-center justify-between text-left',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                      'hover:bg-slate-50 dark:hover:bg-slate-800/60',
                      isExpanded
                        ? 'bg-slate-50 text-slate-800 dark:bg-slate-800/60 dark:text-slate-100'
                        : 'text-slate-600 dark:text-slate-300'
                    )}
                  >
                    <span className="inline-flex min-w-0 items-center gap-2.5">
                      <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-current/30 text-[10px] font-semibold" aria-hidden="true">
                        {groupIcons[groupName as keyof typeof groupIcons]}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{groupName}</span>
                        <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {groupDescriptions[groupName as keyof typeof groupDescriptions]}
                        </span>
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {items.length}
                      </span>
                      <svg
                        className={clsx(
                          'h-4 w-4 transition-transform duration-200',
                          isExpanded && 'rotate-180'
                        )}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </button>

                  {/* Group Items */}
                  {isExpanded && (
                    <div className="space-y-1 border-t border-slate-200 px-2.5 py-2.5 dark:border-slate-800">
                      {items.map((item) => {
                        const iconName = resolvePageIconName(item.label, item.href);
                        return (
                        <div key={item.href}>
                          {/* Main Universe Link */}
                          <Link
                            href={item.href}
                            onClick={closeMenu}
                            className={clsx(
                              'flex items-start gap-3 rounded-lg border px-3 py-2.5',
                              'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                              'border-transparent hover:border-slate-200 hover:bg-slate-50',
                              'dark:hover:border-slate-700 dark:hover:bg-slate-800/60',
                              isRouteActive(item.href)
                                ? 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950'
                                : ''
                            )}
                            role="menuitem"
                          >
                            <span
                              className={clsx(
                                'mt-0.5 h-5 w-5 flex-shrink-0',
                                getPageIconColor(iconName)
                              )}
                            >
                              <PageIcon
                                pageName={iconName}
                                className="w-full h-full"
                              />
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="aurora-label text-sm font-medium text-slate-900 dark:text-slate-50">
                                {item.label}
                              </div>
                              {item.description && (
                                <div className="aurora-label mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                                  {item.description}
                                </div>
                              )}
                            </div>
                            <span className="aurora-label mt-0.5 text-xs text-slate-400 dark:text-slate-500" aria-hidden="true">
                              ↗
                            </span>
                          </Link>

                          {/* Submenu Items */}
                          {item.children && item.children.length > 0 && (
                            <div className="ml-8 mt-1 space-y-1 border-l border-slate-200 pl-2.5 dark:border-slate-700">
                              {item.children.map((child) => {
                                const iconName = resolvePageIconName(child.label, child.href);
                                return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={closeMenu}
                                  className={clsx(
                                    'aurora-label block rounded-md px-3 py-1.5 text-xs',
                                    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                                    'hover:bg-slate-100 dark:hover:bg-slate-800',
                                    isRouteActive(child.href)
                                      ? 'aurora-label bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-50'
                                      : 'aurora-label text-slate-600 dark:text-slate-400'
                                  )}
                                  role="menuitem"
                                >
                                  <div className="font-medium inline-flex items-center gap-1.5">
                                    <span className={clsx('inline-flex h-3.5 w-3.5', getPageIconColor(iconName))} aria-hidden="true">
                                      <PageIcon pageName={iconName} className="h-3.5 w-3.5" />
                                    </span>
                                    <span>{child.label}</span>
                                  </div>
                                  {child.description && (
                                    <div className="aurora-label mt-0.5 truncate text-[10px] text-slate-500 dark:text-slate-500">
                                      {child.description}
                                    </div>
                                  )}
                                </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 border-t border-slate-200 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-950">
            <p className="aurora-label text-center text-[10px] text-slate-400 dark:text-slate-500">
              Press ESC to close • Navigate with keyboard
            </p>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
