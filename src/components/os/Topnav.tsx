'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { primaryNav } from '@/lib/navigation';
import { expandableNavigation, flattenedNavigation } from '@/lib/expandable-navigation';
import { useCartStore } from '@/lib/commerce/cart-store';
import { useOrderStore } from '@/lib/commerce/order-store';
import { ThemeSelector } from '@/components/aurora/ThemeSelector';
import { GlobalSearch } from '@/components/aurora/GlobalSearch';
import { RealtimeNotifications } from '@/components/aurora/RealtimeNotifications';
import { CollapsibleNav } from '@/components/os/CollapsibleNav';
import { DocsPortal } from '@/components/aurora/DocsPortal';
import { KeyboardShortcutsHelp } from '@/components/aurora/KeyboardShortcutsHelp';
import { Button } from '@/components/aurora/Button';
import { useTheme } from '@/lib/design-system/theme-provider';
import { useCompanion } from '@/lib/companion/companion-provider';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { PageIcon, getPageIconColor } from '@/components/aurora/PageIcons';
import { ExpandableMenuItem } from '@/components/aurora/ExpandableMenuItem';
import clsx from 'clsx';

const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export function TopNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { mode } = useTheme();
  const { toggle } = useCompanion();
  const [docsOpen, setDocsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, savedCount, total } = useCartStore();
  const { orderCount, pendingCount } = useOrderStore();
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isBlockingOpen = menuOpen || userMenuOpen || searchOpen || docsOpen || helpOpen;

  const isIlluminated = mode === 'illuminated';
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  // Global keyboard shortcuts
  useKeyboardShortcuts(
    () => setSearchOpen(true),
    () => setDocsOpen(true),
    () => setHelpOpen(true)
  );

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
    };
  }, []);

  const handleMenuMouseEnter = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    setMenuOpen(true);
  };

  const handleMenuMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setMenuOpen(false);
    }, 200);
  };

  // Get current page name from pathname
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

  return (
    <header
      id="navigation"
      role="banner"
      className={clsx(
        'sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800',
        'relative overflow-visible',
        'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl',
        'transition-all duration-300',
        isIlluminated && 'border-blue-400/30 shadow-[0_0_30px_rgba(59,130,246,0.15)]'
      )}
    >
      {isBlockingOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/10"
          onClick={() => {
            setMenuOpen(false);
            setUserMenuOpen(false);
          }}
          role="presentation"
        />
      )}
      <div className="life-topnav-backdrop" aria-hidden="true">
        <span className="life-topnav-ambient" />
        <span className="life-topnav-glaze" />
      </div>
      <div className="mx-auto w-full max-w-7xl px-4 relative z-10">
        <div className="flex flex-col gap-3 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col leading-tight">
                <span className="text-[0.65rem] uppercase tracking-wide text-slate-400">Cart total</span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">
                  {formatMoney(total)}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex flex-col leading-tight">
                <span className="text-[0.65rem] uppercase tracking-wide text-slate-400">Items</span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">
                  {itemCount}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
              <Link href="/commerce/cart#saved" className="flex flex-col leading-tight">
                <span className="text-[0.65rem] uppercase tracking-wide text-slate-400">Saved</span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">
                  {savedCount}
                </span>
              </Link>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
              <Link href="/commerce/orders" className="flex flex-col leading-tight">
                <span className="text-[0.65rem] uppercase tracking-wide text-slate-400">Orders</span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">
                  {orderCount}
                  {pendingCount > 0 && (
                    <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">
                      ({pendingCount})
                    </span>
                  )}
                </span>
              </Link>
              <Link href="/commerce/cart">
                <Button size="sm" variant="secondary">View</Button>
              </Link>
              <Link href="/commerce/checkout">
                <Button size="sm" variant="primary" disabled={itemCount === 0}>
                  Checkout
                </Button>
              </Link>
            </div>

            <div className="flex-1 min-w-[220px] max-w-[560px]">
              <GlobalSearch
                externalOpen={searchOpen}
                onOpenChange={setSearchOpen}
                triggerMode="input"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Logo Menu Button + Aurora Home Button */}
            <div 
              className="relative flex items-center gap-2"
              onMouseEnter={handleMenuMouseEnter}
              onMouseLeave={handleMenuMouseLeave}
            >
              <button
                type="button"
                className={clsx(
                  'relative flex items-center justify-center h-9 w-9 rounded-lg overflow-hidden',
                  'transition-all duration-300',
                  'hover:opacity-90 hover:translate-x-0.5 hover:scale-105',
                  isIlluminated && 'hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                )}
                aria-label="Open navigation menu"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                {/* Gradient Background */}
                <span
                  className={clsx(
                    'absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600',
                    'shadow-lg transition-all duration-300',
                    isIlluminated && 'shadow-[0_0_20px_rgba(59,130,246,0.6)]'
                  )}
                />
                {/* Page Icon Overlay */}
                <span className="relative z-10 w-5 h-5">
                  <PageIcon 
                    pageName={currentPageName} 
                    className={clsx(
                      'w-full h-full drop-shadow-lg transition-all duration-300',
                      'text-white/90'
                    )} 
                  />
                </span>
              </button>
              <Link
                href="/"
                className={clsx(
                  'flex flex-col items-start justify-center hidden sm:flex',
                  'transition-all duration-300 hover:opacity-80'
                )}
              >
                <span className="text-sm font-bold tracking-wider uppercase text-slate-900 dark:text-slate-50">
                  Aurora
                </span>
                <span className="text-[10px] font-medium text-slate-900/50 dark:text-slate-50/50 tracking-wide">
                  {currentPageName}
                </span>
              </Link>
              {menuOpen && (
                <div
                  className={clsx(
                    'aurora-menu-panel absolute left-0 top-12 z-50 w-80 rounded-xl shadow-xl',
                    'border border-slate-200 dark:border-slate-800',
                    'bg-white dark:bg-slate-950',
                    'max-h-[80vh] overflow-y-auto'
                  )}
                  role="menu"
                >
                  <div className="py-2">
                    {['Primary', 'Explore', 'Support'].map((groupName) => {
                      const groupItems = expandableNavigation.filter((item) => item.group === groupName);
                      if (groupItems.length === 0) return null;
                      return (
                        <div key={groupName} className="mb-2 last:mb-0">
                          <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {groupName}
                          </div>
                          {groupItems.map((item) => (
                            <ExpandableMenuItem
                              key={item.href}
                              item={item}
                              onNavigate={() => setMenuOpen(false)}
                              variant="cascading"
                            />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Primary Navigation - Hidden on Mobile */}
            <nav className="hidden md:flex gap-1 flex-1">
              {expandableNavigation
                .filter((item) => item.group === 'Primary')
                .map((item) => (
                  <ExpandableMenuItem
                    key={item.href}
                    item={item}
                    variant="horizontal"
                    isIlluminated={isIlluminated}
                  />
                ))}
            </nav>

            {/* Spacer for centered layout */}
            <div className="hidden md:flex flex-1" />

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <RealtimeNotifications />
              <Link
                href="/commerce/cart"
                className={clsx(
                  'relative inline-flex items-center justify-center rounded-lg p-2',
                  'text-slate-600 dark:text-slate-300',
                  'hover:bg-slate-100 dark:hover:bg-slate-800',
                  'transition-all duration-200'
                )}
                aria-label="Open cart"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.5 12.5a1 1 0 0 0 1 .8h9.5a1 1 0 0 0 1-.8L21 6H6" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-amber-400 px-1.5 py-0.5 text-[0.65rem] font-semibold text-slate-900 shadow">
                    {itemCount}
                  </span>
                )}
              </Link>
          
          {/* Auth Buttons */}
          {!isAuthenticated && !isLoading && (
            <>
              <Link
                href="/auth/signin"
                className={clsx(
                  'hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
                  'text-slate-600 dark:text-slate-300',
                  'hover:bg-slate-100 dark:hover:bg-slate-800',
                  'transition-all duration-200'
                )}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className={clsx(
                  'hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
                  'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
                  'text-white shadow-lg',
                  'transition-all duration-200',
                  isIlluminated && 'shadow-[0_0_20px_rgba(59,130,246,0.6)]'
                )}
              >
                Sign Up
              </Link>
            </>
          )}

          {/* User Menu */}
          {isAuthenticated && session?.user && (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg',
                  'bg-slate-100 dark:bg-slate-800',
                  'hover:bg-slate-200 dark:hover:bg-slate-700',
                  'transition-all duration-200'
                )}
                type="button"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                  {session.user.name?.charAt(0)?.toUpperCase() || session.user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-slate-900 dark:text-slate-50">
                  {session.user.name || 'User'}
                </span>
                <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className={clsx(
                    'aurora-menu-panel absolute right-0 mt-2 w-56 rounded-lg shadow-xl z-50',
                    'bg-white dark:bg-slate-900',
                    'border border-slate-200 dark:border-slate-700',
                    'py-1'
                  )}>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      type="button"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            onClick={() => setDocsOpen(true)}
            className={clsx(
              'relative w-10 h-10 rounded-lg flex items-center justify-center',
              'text-slate-600 dark:text-slate-300',
              'bg-slate-100/70 dark:bg-slate-900/60',
              'border border-slate-200 dark:border-slate-800',
              'hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
            )}
            aria-label="Open documentation"
            title="Docs"
            type="button"
          >
            <span className="text-xs font-semibold">?</span>
          </button>
          <button
            onClick={toggle}
            className={clsx(
              'relative w-10 h-10 rounded-lg flex items-center justify-center',
              'text-slate-600 dark:text-slate-300',
              'bg-slate-100/70 dark:bg-slate-900/60',
              'border border-slate-200 dark:border-slate-800',
              'hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
            )}
            aria-label="Open companion panel"
            title="Companion"
            type="button"
          >
            <span className="text-xs font-semibold">CP</span>
          </button>
          {/* Theme Selector */}
          <ThemeSelector variant="compact" showLabel={false} />

          {/* Collapsible Menu - Mobile Only */}
          <CollapsibleNav />
          
          {/* Docs Portal Modal */}
          <DocsPortal isOpen={docsOpen} onOpenChange={setDocsOpen} />
          
          {/* Keyboard Shortcuts Help Modal */}
          <KeyboardShortcutsHelp isOpen={helpOpen} onOpenChange={setHelpOpen} />
        </div>
      </div>
      </div>
      </div>
      <style jsx>{`
        .life-topnav-backdrop {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.95;
        }
        .life-topnav-ambient {
          position: absolute;
          inset: -60% -20% -60% -20%;
          background: conic-gradient(
            from 90deg,
            rgba(139, 92, 246, 0.35),
            rgba(59, 130, 246, 0.3),
            rgba(236, 72, 153, 0.28),
            rgba(139, 92, 246, 0.35)
          );
          filter: blur(50px);
          animation: life-topnav-hue 9s linear infinite,
            life-topnav-breathe 4.6s ease-in-out infinite;
          will-change: transform, opacity, filter;
        }
        .life-topnav-glaze {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0.18),
            transparent 45%,
            rgba(255, 255, 255, 0.12)
          );
          mix-blend-mode: screen;
          animation: life-topnav-glaze 3.6s ease-in-out infinite;
          will-change: opacity;
        }
        @keyframes life-topnav-hue {
          0% {
            filter: blur(50px) hue-rotate(0deg);
          }
          100% {
            filter: blur(50px) hue-rotate(360deg);
          }
        }
        @keyframes life-topnav-breathe {
          0%, 100% {
            transform: scale3d(0.98, 0.98, 1);
            opacity: 0.65;
          }
          50% {
            transform: scale3d(1.05, 1.05, 1);
            opacity: 0.95;
          }
        }
        @keyframes life-topnav-glaze {
          0%, 100% {
            opacity: 0.25;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </header>
  );
}