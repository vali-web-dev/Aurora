'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { expandableNavigation, flattenedNavigation } from '@/lib/expandable-navigation';
import { useTheme } from '@/lib/design-system/theme-provider';
import { PageIcon, getPageIconColor, resolvePageIconName } from '@/components/aurora/PageIcons';

/**
 * Aurora Context Menu
 * Houses ONLY page-related menu lists - contextual navigation for current section
 * Shows current page name and related pages within the same universe
 */
interface AuroraContextMenuProps {
  onOpenChange?: (open: boolean) => void;
  forceCloseSignal?: number;
}

export function AuroraContextMenu({ onOpenChange, forceCloseSignal = 0 }: AuroraContextMenuProps = {}) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { mode } = useTheme();
  const isIlluminated = mode === 'illuminated';
  const menuId = useId();

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

  // Get current page name
  const currentPageName = (() => {
    if (pathname === '/') return 'Home';
    const matchedItem = flattenedNavigation.find((item) => item.href === pathname);
    if (matchedItem) return matchedItem.label;
    
    // Fallback: extract from pathname
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
    }
    return 'Home';
  })();


  // Get parent universe and related pages
  const getContextualNavigation = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const topLevelPath = pathSegments.length > 0 ? `/${pathSegments[0]}` : '/home';

    // Find parent universe
    const parentUniverse = expandableNavigation.find(
      (item) => item.href === topLevelPath
    );

    if (parentUniverse) {
      return {
        universe: parentUniverse,
        relatedPages: parentUniverse.children || [],
      };
    }

    // If on home page, show home-related items
    if (pathname === '/' || pathname === '/home') {
      const homeUniverse = expandableNavigation.find(
        (item) => item.href === '/home'
      );
      return {
        universe: homeUniverse || { href: '/home', label: 'Home', description: 'Your Aurora home' },
        relatedPages: homeUniverse?.children || [
          { href: '/dashboard', label: 'Dashboard', description: 'Overview & stats' },
          { href: '/profile', label: 'Your Profile', description: 'Manage your identity' },
          { href: '/settings', label: 'Settings', description: 'Preferences & config' },
        ],
      };
    }

    return {
      universe: { href: pathname, label: currentPageName, description: '' },
      relatedPages: [],
    };
  };

  const contextNav = getContextualNavigation();
  const universeIconName = resolvePageIconName(contextNav.universe.label, contextNav.universe.href);

  return (
    <>
      <div
        className="relative z-[9999]"
      >
        {/* Aurora Text Button */}
        <button
          type="button"
          ref={triggerRef}
          onClick={() => {
            setIsPanelOpen((prev) => !prev);
          }}
          className={clsx(
            'inline-flex h-11 items-center justify-center rounded-lg px-1',
            'transition-all duration-300',
            'hover:bg-slate-100 dark:hover:bg-slate-800',
            isIlluminated && 'hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]',
            isPanelOpen && 'bg-slate-100 dark:bg-slate-800'
          )}
          aria-label={`${currentPageName} related pages`}
          aria-haspopup="menu"
          aria-expanded={isPanelOpen}
          aria-controls={isPanelOpen ? menuId : undefined}
        >
        <span className="aurora-label text-sm font-bold uppercase leading-none tracking-wider text-slate-900 dark:text-slate-50">
          Aurora
        </span>
      </button>

      {/* Context Menu */}
      {isPanelOpen && contextNav.relatedPages.length > 0 && (
        <div
          ref={menuRef}
          className={clsx(
            'aurora-menu-panel aurora-menu-panel--clear',
            'absolute left-0 top-11',
            'w-72 rounded-xl shadow-xl',
            'border border-slate-200 dark:border-slate-800',
            'max-h-[400px] overflow-y-auto',
            'animate-in fade-in slide-in-from-top-2 duration-200'
          )}
          style={{ zIndex: 9999 }}
          role="menu"
          id={menuId}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <div className="inline-flex items-center gap-2 aurora-label text-purple-600 dark:text-purple-400">
              <span className={clsx('inline-flex h-4 w-4', getPageIconColor(universeIconName))} aria-hidden="true">
                <PageIcon pageName={universeIconName} className="h-4 w-4" />
              </span>
              <span>{contextNav.universe.label} Universe</span>
            </div>
            {contextNav.universe.description && (
              <div className="aurora-label text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {contextNav.universe.description}
              </div>
            )}
          </div>

          {/* Related Pages */}
          <div className="p-2">
            {contextNav.relatedPages.map((page) => {
              const iconName = resolvePageIconName(page.label, page.href);
              return (
              <Link
                key={page.href}
                href={page.href}
                onClick={closeMenu}
                className={clsx(
                  'block px-3 py-2.5 rounded-lg',
                  'transition-all duration-200',
                  'hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50',
                  'dark:hover:from-purple-950/20 dark:hover:to-blue-950/20',
                  pathname === page.href
                    ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-950 dark:to-blue-950'
                    : ''
                )}
              >
                <div className="inline-flex items-center gap-2 aurora-label text-sm text-slate-900 dark:text-slate-50">
                  <span className={clsx('inline-flex h-4 w-4', getPageIconColor(iconName))} aria-hidden="true">
                    <PageIcon pageName={iconName} className="h-4 w-4" />
                  </span>
                  <span>{page.label}</span>
                </div>
                {page.description && (
                  <div className="aurora-label text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {page.description}
                  </div>
                )}
              </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <Link
              href={contextNav.universe.href}
              onClick={closeMenu}
              className="aurora-label text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium"
            >
              → Explore {contextNav.universe.label}
            </Link>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
