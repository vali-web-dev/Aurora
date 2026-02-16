'use client';

import { useState, useRef, useEffect, type MouseEvent as ReactMouseEvent } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { expandableNavigation } from '@/lib/expandable-navigation';
import { PageIcon, getPageIconColor } from '@/components/aurora/PageIcons';
import { useTheme } from '@/lib/design-system/theme-provider';

/**
 * Aurora Logo Menu
 * Houses ALL main menu lists and submenu lists - the complete navigation system
 * Organized by: Primary, Explore, Support groups
 */
export function AuroraLogoMenu() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Primary']);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const { mode } = useTheme();
  const isIlluminated = mode === 'illuminated';

  // Organize navigation by groups
  const groupedNav = {
    Primary: expandableNavigation.filter((item) => item.group === 'Primary'),
    Explore: expandableNavigation.filter((item) => item.group === 'Explore'),
    Support: expandableNavigation.filter((item) => item.group === 'Support'),
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    setIsPanelOpen(false);
  }, [pathname]);

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

  const openMenu = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsPanelOpen(true);
  };

  const closeMenu = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsPanelOpen(false);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    openMenu();
  };

  const handleMouseLeave = (event: ReactMouseEvent<HTMLElement>) => {
    const relatedTarget = event.relatedTarget as Node | null;
    if (!relatedTarget && isPanelOpen) return;
    if (relatedTarget && (menuRef.current?.contains(relatedTarget) || triggerRef.current?.contains(relatedTarget))) {
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      closeMenu();
    }, 300);
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((g) => g !== groupName)
        : [...prev, groupName]
    );
  };

  return (
    <>
      <div
        className="relative z-[9999]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Aurora Logo Button */}
        <button
          type="button"
          ref={triggerRef}
          onClick={() => {
            if (isPanelOpen) {
              closeMenu();
              return;
            }
            openMenu();
          }}
          className={clsx(
            'relative flex items-center justify-center h-10 w-10 rounded-xl overflow-hidden',
            'transition-all duration-300',
            'hover:scale-105 hover:shadow-xl',
            isIlluminated && 'hover:shadow-[0_0_25px_rgba(139,92,246,0.6)]',
            isPanelOpen && 'scale-105 ring-2 ring-purple-400/40'
          )}
          aria-label="Aurora Navigation Menu"
          aria-haspopup="menu"
          aria-expanded={isPanelOpen}
        >
        {/* Aurora Gradient Background */}
        <span
          className={clsx(
            'absolute inset-0',
            'bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600',
            'shadow-lg transition-all duration-300',
            isIlluminated && 'shadow-[0_0_20px_rgba(139,92,246,0.6)]'
          )}
        />
        {/* Aurora Symbol */}
        <span className="relative z-10 text-white text-xl font-bold">✨</span>
      </button>

      {/* Full Navigation Menu */}
      {isPanelOpen && (
        <div
          ref={menuRef}
          className={clsx(
            'aurora-menu-panel aurora-menu-panel--clear',
            'absolute left-0 top-12',
            'w-[420px] rounded-2xl shadow-2xl',
            'border border-slate-200 dark:border-slate-800',
            'max-h-[calc(100vh-100px)] overflow-y-auto',
            'animate-in fade-in slide-in-from-top-3 duration-300'
          )}
          style={{ zIndex: 9999 }}
          role="menu"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Header */}
          <div className="sticky top-0 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm z-10">
            <h2 className="aurora-heading-3">
              Aurora Universes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Navigate your digital civilization
            </p>
          </div>

          {/* Navigation Groups */}
          <div className="p-3">
            {Object.entries(groupedNav).map(([groupName, items]) => {
              if (items.length === 0) return null;
              const isExpanded = expandedGroups.includes(groupName);

              return (
                <div key={groupName} className="mb-3 last:mb-0">
                  {/* Group Header */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(groupName)}
                    className={clsx(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg',
                      'aurora-label',
                      'transition-all duration-200',
                      'hover:bg-slate-100 dark:hover:bg-slate-800',
                      isExpanded
                        ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30'
                        : 'text-slate-500 dark:text-slate-400'
                    )}
                  >
                    <span>
                      {groupName === 'Primary' && '⭐ '}
                      {groupName === 'Explore' && '🌍 '}
                      {groupName === 'Support' && '🛠️ '}
                      {groupName}
                    </span>
                    <svg
                      className={clsx(
                        'w-4 h-4 transition-transform duration-200',
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
                  </button>

                  {/* Group Items */}
                  {isExpanded && (
                    <div className="mt-1 space-y-0.5">
                      {items.map((item) => (
                        <div key={item.href}>
                          {/* Main Universe Link */}
                          <Link
                            href={item.href}
                            onClick={closeMenu}
                            className={clsx(
                              'flex items-start gap-3 px-3 py-2.5 rounded-lg',
                              'transition-all duration-200',
                              'hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50',
                              'dark:hover:from-purple-950/20 dark:hover:to-pink-950/20',
                              pathname === item.href
                                ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950/40 dark:to-pink-950/40'
                                : ''
                            )}
                          >
                            <span
                              className={clsx(
                                'w-5 h-5 flex-shrink-0 mt-0.5',
                                getPageIconColor(item.label)
                              )}
                            >
                              <PageIcon
                                pageName={item.label}
                                className="w-full h-full"
                              />
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm text-slate-900 dark:text-slate-50">
                                {item.label}
                              </div>
                              {item.description && (
                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </Link>

                          {/* Submenu Items */}
                          {item.children && item.children.length > 0 && (
                            <div className="ml-8 mt-0.5 pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-0.5">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={closeMenu}
                                  className={clsx(
                                    'block px-3 py-1.5 rounded-md text-xs',
                                    'transition-all duration-200',
                                    'hover:bg-slate-100 dark:hover:bg-slate-800',
                                    pathname === child.href
                                      ? 'bg-slate-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-50'
                                      : 'text-slate-600 dark:text-slate-400'
                                  )}
                                >
                                  <div className="font-medium">{child.label}</div>
                                  {child.description && (
                                    <div className="text-[10px] text-slate-500 dark:text-slate-500 truncate mt-0.5">
                                      {child.description}
                                    </div>
                                  )}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
              Press ESC to close • Navigate with keyboard
            </p>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
