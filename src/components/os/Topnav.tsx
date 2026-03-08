'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type FocusEvent as ReactFocusEvent } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { flattenedNavigation } from '@/lib/expandable-navigation';
import { useCartStore } from '@/lib/commerce/cart-store';
import { useOrderStore } from '@/lib/commerce/order-store';
import { ThemeSelector } from '@/components/aurora/ThemeSelector';
import { GlobalSearch } from '@/components/aurora/GlobalSearch';
import { NotificationBellNav } from '@/components/notifications/NotificationBellNav';
import { CollapsibleNav } from '@/components/os/CollapsibleNav';
import { DocsPortal } from '@/components/aurora/DocsPortal';
import { KeyboardShortcutsHelp } from '@/components/aurora/KeyboardShortcutsHelp';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/lib/design-system/theme-provider';
import { useCompanion } from '@/lib/companion/companion-provider';
import { useAuroraLogo } from '@/lib/brand/aurora-logo-provider';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { AuroraLogoMenu } from '@/components/os/AuroraLogoMenu';
import { AuroraContextMenu } from '@/components/os/AuroraContextMenu';
import { PageIcon, getPageIconColor, resolvePageIconName } from '@/components/aurora/PageIcons';
import clsx from 'clsx';

const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const MENU_HINT_SEEN_KEY = 'aurora-topnav-hover-hint-seen';

const hasSeenMenuHintInSession = () => {
  try {
    return window.sessionStorage.getItem(MENU_HINT_SEEN_KEY) === '1';
  } catch {
    return false;
  }
};

const markMenuHintSeen = () => {
  try {
    window.sessionStorage.setItem(MENU_HINT_SEEN_KEY, '1');
  } catch {
    // No-op when storage is unavailable.
  }
};

export function TopNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { mode } = useTheme();
  const { concept, setConcept } = useAuroraLogo();
  const { toggle } = useCompanion();
  const [docsOpen, setDocsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [guestMenuOpen, setGuestMenuOpen] = useState(false);
  const [showMenuHintPulse, setShowMenuHintPulse] = useState(false);
  const [hasSeenMenuHint, setHasSeenMenuHint] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isTopNavInteracting, setIsTopNavInteracting] = useState(false);
  const userCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const guestCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { itemCount, savedCount, total } = useCartStore();
  const { orderCount, pendingCount } = useOrderStore();
  const isBlockingOpen = searchOpen || docsOpen || helpOpen;

  const isIlluminated = mode === 'illuminated';
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    return () => {
      if (userCloseTimerRef.current) clearTimeout(userCloseTimerRef.current);
      if (guestCloseTimerRef.current) clearTimeout(guestCloseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    syncPreference();

    mediaQuery.addEventListener('change', syncPreference);
    return () => mediaQuery.removeEventListener('change', syncPreference);
  }, []);

  useEffect(() => {
    setHasSeenMenuHint(hasSeenMenuHintInSession());
  }, []);

  useEffect(() => {
    const onDesktop = window.matchMedia('(min-width: 768px)').matches;
    if (!onDesktop || prefersReducedMotion) {
      return;
    }

    if (hasSeenMenuHint) {
      return;
    }

    setShowMenuHintPulse(true);
    const timer = window.setTimeout(() => {
      setShowMenuHintPulse(false);
      markMenuHintSeen();
      setHasSeenMenuHint(true);
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion, hasSeenMenuHint]);

  const dismissMenuHint = () => {
    if (!hasSeenMenuHint) {
      markMenuHintSeen();
      setHasSeenMenuHint(true);
    }
    if (showMenuHintPulse) {
      setShowMenuHintPulse(false);
    }
  };

  const handleTopNavBlurCapture = (event: ReactFocusEvent<HTMLElement>) => {
    const relatedTarget = event.relatedTarget as Node | null;
    if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
      setIsTopNavInteracting(false);
    }
  };

  // Global keyboard shortcuts
  useKeyboardShortcuts(
    () => setSearchOpen(true),
    () => setDocsOpen(true),
    () => setHelpOpen(true)
  );

  const breadcrumbSegments = (() => {
    if (pathname === '/' || pathname === '/home') {
      return [{ label: 'Home', href: '/home' }];
    }

    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join('/')}`;
      const matchedItem = flattenedNavigation.find((item) => item.href === href);
      return {
        href,
        label: matchedItem?.label || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      };
    });
  })();



  return (
    <>
    <div
      className="peer fixed inset-x-0 top-0 z-[110] h-3"
      aria-hidden="true"
      onMouseEnter={dismissMenuHint}
    />
    <div
      className={clsx(
        'pointer-events-none fixed left-1/2 top-0 z-[109] hidden -translate-x-1/2 md:inline-flex',
        'items-center gap-1.5 rounded-b-md border border-slate-300/70 bg-white/85 py-0.5',
        hasSeenMenuHint ? 'px-1.5' : 'px-2',
        'aurora-label text-[10px] font-medium text-slate-600 shadow-sm backdrop-blur-sm',
        'dark:border-slate-700/70 dark:bg-slate-900/85 dark:text-slate-300',
        'transition-all duration-300',
        showMenuHintPulse && !prefersReducedMotion && 'animate-pulse opacity-80',
        isBlockingOpen || isTopNavInteracting
          ? 'opacity-0 -translate-y-1'
          : 'opacity-90 peer-hover:opacity-0 peer-hover:-translate-y-1',
        isIlluminated && 'border-blue-400/50 shadow-[0_0_14px_rgba(59,130,246,0.25)]'
      )}
      aria-hidden="true"
    >
      <svg className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 12l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span
        className={clsx(
          'transition-all duration-200',
          hasSeenMenuHint
            ? 'max-w-0 overflow-hidden opacity-0 md:peer-hover:max-w-28 md:peer-hover:opacity-100'
            : 'max-w-28 opacity-100'
        )}
      >
        Hover to open menu
      </span>
    </div>
    <header
      id="navigation"
      role="banner"
      className={clsx(
        'topnav-reset',
        'sticky top-0 z-[100] border-b border-slate-200 dark:border-slate-800',
        'relative overflow-visible',
        'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl',
        'transition-all duration-300',
        isBlockingOpen
          ? 'translate-y-0'
          : 'translate-y-0 md:-translate-y-full md:peer-hover:translate-y-0 md:hover:translate-y-0 md:focus-within:translate-y-0',
        isIlluminated && 'border-blue-400/30 shadow-[0_0_30px_rgba(59,130,246,0.15)]'
      )}
      onMouseEnter={() => setIsTopNavInteracting(true)}
      onMouseLeave={() => setIsTopNavInteracting(false)}
      onFocusCapture={() => {
        setIsTopNavInteracting(true);
        dismissMenuHint();
      }}
      onBlurCapture={handleTopNavBlurCapture}
    >
      {isBlockingOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/10"
          onClick={() => {
            setSearchOpen(false);
            setDocsOpen(false);
            setHelpOpen(false);
          }}
          role="presentation"
        />
      )}
      <div className="life-topnav-backdrop" aria-hidden="true">
        <span className="life-topnav-ambient" />
        <span className="life-topnav-glaze" />
      </div>
      <div className="mx-auto w-full max-w-7xl px-4 relative z-10">
        <div className="flex flex-col gap-2 py-2.5">
          <div className="flex items-start gap-3">
            {/* Aurora Navigation - Clean Architecture */}
            <div className="flex items-start gap-3 shrink-0">
              {/* Aurora Logo Menu - All Universes */}
              <div className="mt-[10px] h-11 flex items-start">
                <AuroraLogoMenu />
              </div>

              {/* Aurora Context Menu - Current Page */}
              <div className="hidden sm:block h-11">
                <AuroraContextMenu />
              </div>
            </div>

            <div className="flex-1 min-w-[220px] max-w-[620px]">
              <GlobalSearch
                externalOpen={searchOpen}
                onOpenChange={setSearchOpen}
                triggerMode="input"
                className="w-full"
              />
              <div className="mt-1.5 hidden sm:flex justify-center">
                <div className="origin-top scale-[0.363]">
                  <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[10px]">
                    {breadcrumbSegments.map((crumb, index) => {
                      const isLast = index === breadcrumbSegments.length - 1;
                      const iconName = resolvePageIconName(crumb.label, crumb.href);
                      return (
                        <div key={`${crumb.href}-${index}`} className="flex items-center gap-1">
                          {index > 0 && <span className="aurora-label text-slate-400 dark:text-slate-500">/</span>}
                          {isLast ? (
                            <span className="aurora-label inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                              <span className={clsx('inline-flex h-3.5 w-3.5', getPageIconColor(iconName))} aria-hidden="true">
                                <PageIcon pageName={iconName} className="h-3.5 w-3.5" />
                              </span>
                              <span>{crumb.label}</span>
                            </span>
                          ) : (
                            <Link
                              href={crumb.href}
                              className="aurora-label inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            >
                              <span className={clsx('inline-flex h-3.5 w-3.5', getPageIconColor(iconName))} aria-hidden="true">
                                <PageIcon pageName={iconName} className="h-3.5 w-3.5" />
                              </span>
                              <span>{crumb.label}</span>
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-start justify-end gap-3 h-11 shrink-0">
              <NotificationBellNav />
              <div className="group relative">
                <Link
                  href="/commerce/cart"
                  className={clsx(
                    'aurora-label relative inline-flex h-11 w-11 items-center justify-center rounded-lg',
                    'text-slate-600 dark:text-slate-300',
                    'hover:bg-slate-100 dark:hover:bg-slate-800',
                    'transition-all duration-200'
                  )}
                  aria-label="Open cart"
                >
                  <svg
                    className="h-6 w-6"
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

                <div
                  className={clsx(
                    'aurora-menu-panel absolute right-0 top-full mt-2 w-72 rounded-lg border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900 z-[9999]',
                    'opacity-0 translate-y-1 pointer-events-none transition-all duration-200',
                    'group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto',
                    'group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto'
                  )}
                >
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md border border-slate-200 px-2 py-1.5 dark:border-slate-700">
                      <p className="aurora-label text-slate-400">Cart total</p>
                      <p className="aurora-label font-semibold text-slate-900 dark:text-slate-100">{formatMoney(total)}</p>
                    </div>
                    <div className="rounded-md border border-slate-200 px-2 py-1.5 dark:border-slate-700">
                      <p className="aurora-label text-slate-400">Items</p>
                      <p className="aurora-label font-semibold text-slate-900 dark:text-slate-100">{itemCount}</p>
                    </div>
                    <div className="rounded-md border border-slate-200 px-2 py-1.5 dark:border-slate-700">
                      <p className="aurora-label text-slate-400">Saved</p>
                      <p className="aurora-label font-semibold text-slate-900 dark:text-slate-100">{savedCount}</p>
                    </div>
                    <div className="rounded-md border border-slate-200 px-2 py-1.5 dark:border-slate-700">
                      <p className="aurora-label text-slate-400">Orders</p>
                      <p className="aurora-label font-semibold text-slate-900 dark:text-slate-100">
                        {orderCount}
                        {pendingCount > 0 && (
                          <span className="aurora-label ml-1 text-[10px] text-blue-600 dark:text-blue-400">({pendingCount})</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Link href="/commerce/cart" className="flex-1">
                      <Button size="sm" variant="secondary" className="w-full">View</Button>
                    </Link>
                    <Link href="/commerce/checkout" className="flex-1">
                      <Button size="sm" variant="primary" className="w-full" disabled={itemCount === 0}>
                        Checkout
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
          
          {/* Auth Buttons */}
          {!isAuthenticated && !isLoading && (
            <>
              <div
                className="relative"
                onMouseEnter={() => {
                  if (guestCloseTimerRef.current) clearTimeout(guestCloseTimerRef.current);
                  setGuestMenuOpen(true);
                }}
                onMouseLeave={() => {
                  if (guestCloseTimerRef.current) clearTimeout(guestCloseTimerRef.current);
                  guestCloseTimerRef.current = setTimeout(() => setGuestMenuOpen(false), 120);
                }}
                onFocusCapture={() => setGuestMenuOpen(true)}
                onBlurCapture={(event) => {
                  const next = event.relatedTarget as Node | null;
                  if (!event.currentTarget.contains(next)) {
                    setGuestMenuOpen(false);
                  }
                }}
              >
                <button
                  onClick={() => setGuestMenuOpen(!guestMenuOpen)}
                  className={clsx(
                    'relative inline-flex h-11 w-11 items-center justify-center rounded-full',
                    'bg-slate-100 dark:bg-slate-800',
                    'hover:bg-slate-200 dark:hover:bg-slate-700',
                    'transition-all duration-200'
                  )}
                  aria-label="Open guest menu"
                  aria-expanded={guestMenuOpen}
                  type="button"
                >
                  <div className="aurora-label h-9 w-9 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white text-sm font-semibold">
                    G
                  </div>
                </button>

                {guestMenuOpen && (
                  <>
                    <div className={clsx(
                      'aurora-menu-panel absolute right-0 mt-2 w-56 rounded-lg shadow-xl z-[9999]',
                      'bg-white dark:bg-slate-900',
                      'border border-slate-200 dark:border-slate-700',
                      'py-1 max-h-80 overflow-y-auto'
                    )}>
                      <div className="px-4 py-2">
                        <p className="aurora-label text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Account
                        </p>
                      </div>
                      <Link
                        href="/auth/signin"
                        className="aurora-label block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={() => setGuestMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/signup"
                        className="aurora-label block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={() => setGuestMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                      <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
                      <button
                        onClick={() => {
                          setGuestMenuOpen(false);
                          toggle();
                        }}
                        className="aurora-label block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        type="button"
                      >
                        CP (Companion)
                      </button>
                      <button
                        onClick={() => {
                          setGuestMenuOpen(false);
                          setHelpOpen(true);
                        }}
                        className="aurora-label block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        type="button"
                      >
                        Help
                      </button>
                      <button
                        onClick={() => {
                          setGuestMenuOpen(false);
                          setDocsOpen(true);
                        }}
                        className="aurora-label block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        type="button"
                      >
                        Docs
                      </button>
                      <div className="px-4 py-2">
                        <p className="aurora-label mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Logo Mode
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setConcept('core')}
                            className={clsx(
                              'aurora-label rounded-md px-2 py-1 text-xs transition-colors',
                              concept === 'core'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            )}
                          >
                            C1
                          </button>
                          <button
                            type="button"
                            onClick={() => setConcept('wave')}
                            className={clsx(
                              'aurora-label rounded-md px-2 py-1 text-xs transition-colors',
                              concept === 'wave'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-200'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            )}
                          >
                            C2
                          </button>
                        </div>
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
                      <div className="px-4 py-2">
                        <p className="aurora-label mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Themes And Modes
                        </p>
                        <ThemeSelector variant="compact" showLabel={false} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* User Menu */}
          {isAuthenticated && session?.user && (
            <div
              className="relative"
              onMouseEnter={() => {
                if (userCloseTimerRef.current) clearTimeout(userCloseTimerRef.current);
                setUserMenuOpen(true);
              }}
              onMouseLeave={() => {
                if (userCloseTimerRef.current) clearTimeout(userCloseTimerRef.current);
                userCloseTimerRef.current = setTimeout(() => setUserMenuOpen(false), 120);
              }}
              onFocusCapture={() => setUserMenuOpen(true)}
              onBlurCapture={(event) => {
                const next = event.relatedTarget as Node | null;
                if (!event.currentTarget.contains(next)) {
                  setUserMenuOpen(false);
                }
              }}
            >
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={clsx(
                  'relative inline-flex h-11 w-11 items-center justify-center rounded-full',
                  'bg-slate-100 dark:bg-slate-800',
                  'hover:bg-slate-200 dark:hover:bg-slate-700',
                  'transition-all duration-200'
                )}
                aria-expanded={userMenuOpen}
                type="button"
              >
                <div className="aurora-label h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                  {session.user.name?.charAt(0)?.toUpperCase() || session.user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <>
                  <div className={clsx(
                    'aurora-menu-panel absolute right-0 mt-2 w-56 rounded-lg shadow-xl z-[9999]',
                    'bg-white dark:bg-slate-900',
                    'border border-slate-200 dark:border-slate-700',
                    'py-1 max-h-80 overflow-y-auto'
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
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        toggle();
                      }}
                      className="aurora-label block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      type="button"
                    >
                      CP (Companion)
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        setHelpOpen(true);
                      }}
                      className="aurora-label block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      type="button"
                    >
                      Help
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        setDocsOpen(true);
                      }}
                      className="aurora-label block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      type="button"
                    >
                      Docs
                    </button>
                    <div className="px-4 py-2">
                      <p className="aurora-label mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Logo Mode
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setConcept('core')}
                          className={clsx(
                            'aurora-label rounded-md px-2 py-1 text-xs transition-colors',
                            concept === 'core'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          )}
                        >
                          C1
                        </button>
                        <button
                          type="button"
                          onClick={() => setConcept('wave')}
                          className={clsx(
                            'aurora-label rounded-md px-2 py-1 text-xs transition-colors',
                            concept === 'wave'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-200'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          )}
                        >
                          C2
                        </button>
                      </div>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
                    <div className="px-4 py-2">
                      <p className="aurora-label mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Themes And Modes
                      </p>
                      <ThemeSelector variant="compact" showLabel={false} />
                    </div>
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
        .topnav-reset,
        .topnav-reset :global(*) {
          margin: 0 !important;
          padding: 0 !important;
        }
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
    </>
  );
}