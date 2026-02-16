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
import { ExpandableMenuItem } from '@/components/aurora/ExpandableMenuItem';
import { AuroraLogoMenu } from '@/components/os/AuroraLogoMenu';
import { AuroraContextMenu } from '@/components/os/AuroraContextMenu';
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
  const { itemCount, savedCount, total } = useCartStore();
  const { orderCount, pendingCount } = useOrderStore();
  const isBlockingOpen = userMenuOpen || searchOpen || docsOpen || helpOpen;

  const isIlluminated = mode === 'illuminated';
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  // Global keyboard shortcuts
  useKeyboardShortcuts(
    () => setSearchOpen(true),
    () => setDocsOpen(true),
    () => setHelpOpen(true)
  );



  return (
    <header
      id="navigation"
      role="banner"
      className={clsx(
        'sticky top-0 z-[100] border-b border-slate-200 dark:border-slate-800',
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
                <span className="aurora-label aurora-text-xs text-slate-400">Cart total</span>
                <span className="aurora-label font-semibold text-slate-900 dark:text-slate-50">
                  {formatMoney(total)}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex flex-col leading-tight">
                <span className="aurora-label aurora-text-xs text-slate-400">Items</span>
                <span className="aurora-label font-semibold text-slate-900 dark:text-slate-50">
                  {itemCount}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
              <Link href="/commerce/cart#saved" className="flex flex-col leading-tight">
                <span className="aurora-label aurora-text-xs text-slate-400">Saved</span>
                <span className="aurora-label font-semibold text-slate-900 dark:text-slate-50">
                  {savedCount}
                </span>
              </Link>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
              <Link href="/commerce/orders" className="flex flex-col leading-tight">
                <span className="aurora-label aurora-text-xs text-slate-400">Orders</span>
                <span className="aurora-label font-semibold text-slate-900 dark:text-slate-50">
                  {orderCount}
                  {pendingCount > 0 && (
                    <span className="aurora-label ml-1 text-xs text-blue-600 dark:text-blue-400">
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
            {/* Aurora Navigation - Clean Architecture */}
            <div className="flex items-center gap-3">
              {/* Aurora Logo Menu - All Universes */}
              <AuroraLogoMenu />
              
              {/* Aurora Context Menu - Current Page */}
              <div className="hidden sm:block">
                <AuroraContextMenu />
              </div>
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
                  'aurora-label relative inline-flex items-center justify-center rounded-lg p-2',
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
                  <span className="aurora-label absolute -right-1 -top-1 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-amber-400 px-1.5 py-0.5 text-[0.65rem] font-semibold text-slate-900 shadow">
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
                  'aurora-label text-slate-600 dark:text-slate-300',
                  'hover:bg-slate-100 dark:hover:bg-slate-800',
                  'transition-all duration-200'
                )}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className={clsx(
                  'aurora-label hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
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
                <div className="aurora-label w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                  {session.user.name?.charAt(0)?.toUpperCase() || session.user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="aurora-label hidden sm:inline text-sm font-medium text-slate-900 dark:text-slate-50">
                  {session.user.name || 'User'}
                </span>
                <svg className="aurora-label w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    'aurora-menu-panel absolute right-0 mt-2 w-56 rounded-lg shadow-xl z-[9999]',
                    'bg-white dark:bg-slate-900',
                    'border border-slate-200 dark:border-slate-700',
                    'py-1'
                  )}>
                    <Link
                      href="/dashboard"
                      className="aurora-label block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="aurora-label block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="aurora-label block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                      className="aurora-label block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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
              'aurora-label relative w-10 h-10 rounded-lg flex items-center justify-center',
              'text-slate-600 dark:text-slate-300',
              'bg-slate-100/70 dark:bg-slate-900/60',
              'border border-slate-200 dark:border-slate-800',
              'hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
            )}
            aria-label="Open documentation"
            title="Docs"
            type="button"
          >
            <span className="aurora-label text-xs font-semibold">?</span>
          </button>
          <button
            onClick={toggle}
            className={clsx(
              'aurora-label relative w-10 h-10 rounded-lg flex items-center justify-center',
              'text-slate-600 dark:text-slate-300',
              'bg-slate-100/70 dark:bg-slate-900/60',
              'border border-slate-200 dark:border-slate-800',
              'hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
            )}
            aria-label="Open companion panel"
            title="Companion"
            type="button"
          >
            <span className="aurora-label text-xs font-semibold">CP</span>
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