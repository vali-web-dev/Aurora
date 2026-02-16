/**
 * Expandable Menu Item Component
 * Displays navigation items with hover-to-expand submenu functionality
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { PageIcon, getPageIconColor } from '@/components/aurora/PageIcons';
import type { NavItem } from '@/lib/expandable-navigation';
import clsx from 'clsx';

interface ExpandableMenuItemProps {
  item: NavItem;
  onNavigate?: () => void;
  variant?: 'dropdown' | 'horizontal' | 'cascading';
  isIlluminated?: boolean;
}

export function ExpandableMenuItem({
  item,
  onNavigate,
  variant = 'dropdown',
  isIlluminated = false,
}: ExpandableMenuItemProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const isActive = pathname === item.href;
  const hasChildren = item.children && item.children.length > 0;

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (hasChildren) {
      setIsExpanded(true);
      // Calculate position for cascading variant
      if (variant === 'cascading' && itemRef.current) {
        const rect = itemRef.current.getBoundingClientRect();
        setSubmenuPosition({
          top: rect.top,
          left: rect.right + 8, // 8px gap
        });
      }
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 200); // 200ms delay before closing
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Update submenu position on scroll for cascading variant
  useEffect(() => {
    if (variant === 'cascading' && isExpanded && itemRef.current) {
      const updatePosition = () => {
        if (itemRef.current) {
          const rect = itemRef.current.getBoundingClientRect();
          setSubmenuPosition({
            top: rect.top,
            left: rect.right + 8,
          });
        }
      };

      window.addEventListener('scroll', updatePosition, true);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [variant, isExpanded]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  if (variant === 'horizontal') {
    // Horizontal menu variant (for main nav bar)
    return (
      <div
        className="relative group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link
          href={item.href}
          onClick={handleClick}
          className={clsx(
            'aurora-label px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2',
            'transition-all duration-200',
            isActive
              ? clsx(
                  'aurora-label bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-md',
                  isIlluminated && 'shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                )
              : clsx(
                  'aurora-label text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50',
                  'hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:shadow-sm',
                  isIlluminated && 'hover:bg-blue-950/20 hover:shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                )
          )}
        >
          <span>{item.label}</span>
          {hasChildren && (
            <svg
              className={clsx(
                'w-3 h-3 transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </Link>

        {/* Submenu - Horizontal */}
        {hasChildren && isExpanded && (
          <div
            className={clsx(
              'aurora-menu-panel aurora-menu-panel--clear absolute top-full left-0 mt-1 z-[9999]',
              'min-w-[220px] rounded-xl shadow-xl',
              'border border-slate-200 dark:border-slate-800',
              'py-2 animate-in fade-in slide-in-from-top-2 duration-200'
            )}
          >
            {item.children!.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={handleClick}
                className={clsx(
                  'aurora-label flex items-start gap-3 px-4 py-2.5 text-sm transition-colors',
                  'aurora-label text-slate-700 dark:text-slate-200',
                  'hover:bg-slate-100 dark:hover:bg-slate-900',
                  pathname === child.href && 'bg-slate-100 dark:bg-slate-800 font-medium'
                )}
              >
                <span className={clsx('w-4 h-4 flex-shrink-0 mt-0.5', getPageIconColor(child.label))}>
                  <PageIcon pageName={child.label} className="w-full h-full" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="aurora-label font-medium">{child.label}</div>
                  {child.description && (
                    <div className="aurora-label text-xs text-slate-500 dark:text-slate-400 truncate">
                      {child.description}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Cascading variant (for logo menu - submenus appear to the right)
  if (variant === 'cascading') {
    return (
      <div
        ref={itemRef}
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link
          href={item.href}
          onClick={handleClick}
          className={clsx(
            'aurora-label flex items-center gap-3 px-4 py-2.5 text-sm transition-colors group',
            'aurora-label text-slate-700 dark:text-slate-200',
            'hover:bg-slate-100 dark:hover:bg-slate-900',
            isActive && 'bg-slate-100 dark:bg-slate-800 font-medium'
          )}
        >
          <span className={clsx('w-4 h-4 flex-shrink-0', getPageIconColor(item.label))}>
            <PageIcon pageName={item.label} className="w-full h-full" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-medium">{item.label}</div>
            {item.description && (
              <div className="aurora-label text-xs text-slate-500 dark:text-slate-400 truncate">
                {item.description}
              </div>
            )}
          </div>
          {hasChildren && (
            <svg
              className="w-3 h-3 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </Link>

        {/* Submenu - Cascading (appears to the right) */}
        {hasChildren && isExpanded && (
          <div
            className={clsx(
              'aurora-menu-panel aurora-menu-panel--clear fixed z-[9999]',
              'min-w-[280px] max-w-[320px] rounded-xl shadow-2xl',
              'border border-slate-200 dark:border-slate-800',
              'py-2 animate-in fade-in slide-in-from-left-2 duration-200',
              'max-h-[70vh] overflow-y-auto'
            )}
            style={{
              top: `${submenuPosition.top}px`,
              left: `${submenuPosition.left}px`,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {item.children!.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={handleClick}
                className={clsx(
                  'aurora-label flex items-start gap-3 px-4 py-2.5 text-sm transition-colors',
                  'aurora-label text-slate-700 dark:text-slate-200',
                  'hover:bg-slate-100 dark:hover:bg-slate-900',
                  pathname === child.href && 'bg-slate-100 dark:bg-slate-800 font-medium'
                )}
              >
                <span className={clsx('w-4 h-4 flex-shrink-0 mt-0.5', getPageIconColor(child.label))}>
                  <PageIcon pageName={child.label} className="w-full h-full" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{child.label}</div>
                  {child.description && (
                    <div className="aurora-label text-xs text-slate-500 dark:text-slate-400 truncate">
                      {child.description}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Dropdown variant (for logo menu and mobile)
  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={item.href}
        onClick={handleClick}
        className={clsx(
          'aurora-label flex items-center gap-3 px-4 py-2.5 text-sm transition-colors group',
          'aurora-label text-slate-700 dark:text-slate-200',
          'hover:bg-slate-100 dark:hover:bg-slate-900',
          isActive && 'bg-slate-100 dark:bg-slate-800 font-medium'
        )}
      >
        <span className={clsx('w-4 h-4 flex-shrink-0', getPageIconColor(item.label))}>
          <PageIcon pageName={item.label} className="w-full h-full" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-medium">{item.label}</div>
          {item.description && (
            <div className="aurora-label text-xs text-slate-500 dark:text-slate-400 truncate">
              {item.description}
            </div>
          )}
        </div>
        {hasChildren && (
          <svg
            className={clsx(
              'w-3 h-3 flex-shrink-0 transition-transform duration-200',
              isExpanded && 'rotate-90'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </Link>

      {/* Submenu - Dropdown */}
      {hasChildren && isExpanded && (
        <div
          className={clsx(
            'ml-4 pl-4 border-l-2 border-slate-200 dark:border-slate-800',
            'animate-in fade-in slide-in-from-left-1 duration-200'
          )}
        >
          {item.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={handleClick}
              className={clsx(
                'aurora-label flex items-start gap-3 px-4 py-2 text-sm transition-colors',
                'aurora-label text-slate-600 dark:text-slate-300',
                'hover:bg-slate-100 dark:hover:bg-slate-900',
                pathname === child.href && 'bg-slate-100 dark:bg-slate-800 font-medium'
              )}
            >
              <span className={clsx('w-3.5 h-3.5 flex-shrink-0 mt-0.5', getPageIconColor(child.label))}>
                <PageIcon pageName={child.label} className="w-full h-full" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="aurora-label text-xs font-medium">{child.label}</div>
                {child.description && (
                  <div className="aurora-label text-[10px] text-slate-500 dark:text-slate-500 truncate">
                    {child.description}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
