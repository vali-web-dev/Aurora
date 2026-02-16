'use client';

import { useState, useRef, useEffect, type MouseEvent as ReactMouseEvent } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { expandableNavigation, flattenedNavigation } from '@/lib/expandable-navigation';
import { useTheme } from '@/lib/design-system/theme-provider';

/**
 * Aurora Context Menu
 * Houses ONLY page-related menu lists - contextual navigation for current section
 * Shows current page name and related pages within the same universe
 */
export function AuroraContextMenu() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const { mode } = useTheme();
  const isIlluminated = mode === 'illuminated';

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

  return (
    <>
      <div
        className="relative z-[9999]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Aurora Text Button */}
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
            'flex flex-col items-start justify-center px-3 py-1.5 rounded-lg',
            'transition-all duration-300',
            'hover:bg-slate-100 dark:hover:bg-slate-800',
            isIlluminated && 'hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]',
            isPanelOpen && 'bg-slate-100 dark:bg-slate-800'
          )}
          aria-label={`${currentPageName} related pages`}
          aria-haspopup="menu"
          aria-expanded={isPanelOpen}
        >
        <span className="text-sm font-bold tracking-wider uppercase text-slate-900 dark:text-slate-50">
          Aurora
        </span>
        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">
          {currentPageName}
        </span>
      </button>

      {/* Context Menu */}
      {isPanelOpen && contextNav.relatedPages.length > 0 && (
        <div
          ref={menuRef}
          className={clsx(
            'aurora-menu-panel aurora-menu-panel--clear',
            'absolute left-0 top-12',
            'w-72 rounded-xl shadow-xl',
            'border border-slate-200 dark:border-slate-800',
            'max-h-[400px] overflow-y-auto',
            'animate-in fade-in slide-in-from-top-2 duration-200'
          )}
          style={{ zIndex: 9999 }}
          role="menu"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
            <div className="aurora-label text-purple-600 dark:text-purple-400">
              {contextNav.universe.label} Universe
            </div>
            {contextNav.universe.description && (
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {contextNav.universe.description}
              </div>
            )}
          </div>

          {/* Related Pages */}
          <div className="p-2">
            {contextNav.relatedPages.map((page) => (
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
                    ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-950/40 dark:to-blue-950/40'
                    : ''
                )}
              >
                <div className="font-semibold text-sm text-slate-900 dark:text-slate-50">
                  {page.label}
                </div>
                {page.description && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {page.description}
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95">
            <Link
              href={contextNav.universe.href}
              onClick={closeMenu}
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium"
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
