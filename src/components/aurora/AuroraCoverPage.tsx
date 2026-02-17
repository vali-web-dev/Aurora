'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/aurora/Button';
import { AuroraLogo } from '@/components/aurora/AuroraLogo';
import { useAuroraLogo } from '@/lib/brand/aurora-logo-provider';
import clsx from 'clsx';
import { expandableNavigation, type NavItem } from '@/lib/expandable-navigation';
import { PageIcon, getPageIconColor } from '@/components/aurora/PageIcons';

interface UniversePortal {
  name: string;
  href: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
  tagline: string;
}

const universes: UniversePortal[] = [
  {
    name: 'Entertainment',
    href: '/entertainment',
    icon: '🎬',
    color: 'from-purple-500 via-pink-500 to-rose-500',
    gradient: 'from-purple-500/20 to-pink-500/20',
    description: 'Immerse in infinite media',
    tagline: 'Music, Movies, Shows & More',
  },
  {
    name: 'Commerce',
    href: '/commerce',
    icon: '🛍️',
    color: 'from-emerald-500 via-teal-500 to-cyan-500',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    description: 'Shop across realities',
    tagline: 'Unified Marketplace',
  },
  {
    name: 'Social',
    href: '/social',
    icon: '👥',
    color: 'from-blue-500 via-indigo-500 to-purple-500',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    description: 'Connect beyond boundaries',
    tagline: 'Your Digital Society',
  },
  {
    name: 'Learning',
    href: '/learning',
    icon: '📚',
    color: 'from-amber-500 via-orange-500 to-red-500',
    gradient: 'from-amber-500/20 to-orange-500/20',
    description: 'Knowledge without limits',
    tagline: 'Evolve Your Mind',
  },
  {
    name: 'Create',
    href: '/create',
    icon: '🎨',
    color: 'from-rose-500 via-pink-500 to-fuchsia-500',
    gradient: 'from-rose-500/20 to-pink-500/20',
    description: 'Craft the impossible',
    tagline: 'Design & Innovation',
  },
  {
    name: 'Productivity',
    href: '/productivity',
    icon: '📊',
    color: 'from-indigo-500 via-violet-500 to-purple-500',
    gradient: 'from-indigo-500/20 to-violet-500/20',
    description: 'Achieve exponentially',
    tagline: 'Work Reimagined',
  },
];

const floatingParticles = Array.from({ length: 20 }, (_, index) => {
  const seed = (index + 1) * 13.37;
  const left = (seed * 17) % 100;
  const delay = (seed * 7) % 5;
  const duration = 8 + ((seed * 11) % 4);
  const drift = Math.round(((seed * 19) % 100) - 50);
  return { left, delay, duration, drift };
});

export function AuroraCoverPage() {
  const router = useRouter();
  const { concept, setConcept } = useAuroraLogo();
  const [hoveredUniverse, setHoveredUniverse] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isAuroraMenuOpen, setIsAuroraMenuOpen] = useState(false);
  const [isAuroraMenuVisible, setIsAuroraMenuVisible] = useState(false);
  const [activeMenuIndex, setActiveMenuIndex] = useState(0);
  const primaryNav = expandableNavigation.filter((item) => item.group === 'Primary');
  const activeMenu = primaryNav[activeMenuIndex] ?? primaryNav[0];
  const menuCloseTimeoutRef = useRef<number | null>(null);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);
  const menuAnimationMs = 220;
  const portalNodes = primaryNav.slice(0, 8);
  const subPortalNodes = primaryNav
    .flatMap((item) => item.children ?? [])
    .slice(0, 12);

  const openAuroraMenu = () => {
    if (menuCloseTimeoutRef.current) {
      window.clearTimeout(menuCloseTimeoutRef.current);
    }
    setIsAuroraMenuVisible(true);
    setIsAuroraMenuOpen(true);
  };

  const closeAuroraMenu = () => {
    setIsAuroraMenuOpen(false);
    if (menuCloseTimeoutRef.current) {
      window.clearTimeout(menuCloseTimeoutRef.current);
    }
    menuCloseTimeoutRef.current = window.setTimeout(() => {
      setIsAuroraMenuVisible(false);
    }, menuAnimationMs);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuroraMenuOpen) {
      return;
    }

    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [isAuroraMenuOpen]);

  useEffect(() => {
    return () => {
      if (menuCloseTimeoutRef.current) {
        window.clearTimeout(menuCloseTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isAuroraMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (primaryNav.length === 0) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeAuroraMenu();
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveMenuIndex((index) => (index + 1) % primaryNav.length);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveMenuIndex((index) => (index - 1 + primaryNav.length) % primaryNav.length);
        return;
      }

      if (event.key === 'Enter' && activeMenu?.href) {
        event.preventDefault();
        closeAuroraMenu();
        router.push(activeMenu.href);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMenu?.href, isAuroraMenuOpen, primaryNav.length, router]);

  useEffect(() => {
    if (!isAuroraMenuOpen || !menuPanelRef.current) {
      return;
    }

    const panel = menuPanelRef.current;
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];
    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelectors.join(',')));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (first) {
      first.focus();
    }

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || focusable.length === 0) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isAuroraMenuOpen]);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse transform-gpu" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse transform-gpu" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-3xl animate-pulse transform-gpu" style={{ animationDelay: '2s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Scanning Line */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute h-[2px] w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-scan" />
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingParticles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/40 rounded-full animate-float"
              style={{
                left: `${particle.left}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
                '--float-x': `${particle.drift}px`,
              } as CSSProperties}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-3 relative">
            <button
              type="button"
              aria-expanded={isAuroraMenuOpen}
              aria-controls="aurora-gateway-menu"
              onClick={() => (isAuroraMenuOpen ? closeAuroraMenu() : openAuroraMenu())}
              className="group focus:outline-none"
            >
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50 transition-all duration-300 group-hover:shadow-purple-500/80 group-hover:scale-105">
                <span className="text-2xl">✨</span>
                <div className="absolute inset-0 rounded-xl ring-2 ring-purple-400/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </button>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/signin">
              <Button variant="auroraGhost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="aurora" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </header>

        {isAuroraMenuVisible && (
          <div
            id="aurora-gateway-menu"
            className={clsx(
              'fixed inset-0 z-20 transition-opacity duration-200',
              isAuroraMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            )}
          >
            <div
              className={clsx(
                'absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200',
                isAuroraMenuOpen ? 'opacity-100' : 'opacity-0'
              )}
              onClick={closeAuroraMenu}
            />
            <div className="absolute left-6 right-6 top-12 bottom-6">
              <div
                ref={menuPanelRef}
                className={clsx(
                  'aurora-menu-panel aurora-menu-panel--clear relative z-[9999] max-h-full overflow-y-auto rounded-3xl border border-white/10 p-8 shadow-2xl shadow-purple-500/30',
                  'transition-all duration-300 ease-out',
                  isAuroraMenuOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
                )}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="life-gateway-backdrop" aria-hidden="true">
                  <span className="life-gateway-ambient" />
                  <span className="life-gateway-glaze" />
                </div>
                <div className="absolute -right-24 -top-24 w-72 h-72 bg-purple-500/20 blur-3xl" />
                <div className="absolute -left-16 bottom-0 w-56 h-56 bg-blue-500/20 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.12),transparent_55%)]" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
                  <div className="space-y-3">
                    <div className="aurora-label tracking-[0.3em] text-purple-200/70">Aurora Portals</div>
                    {primaryNav.map((item, index) => (
                      <button
                        key={item.href}
                        type="button"
                        onMouseEnter={() => setActiveMenuIndex(index)}
                        onFocus={() => setActiveMenuIndex(index)}
                        onClick={() => {
                          closeAuroraMenu();
                          router.push(item.href);
                        }}
                        className={clsx(
                          'life-gateway-button',
                          'w-full text-left p-4 rounded-2xl border transition-all duration-200',
                          'hover:-translate-y-0.5 hover:translate-x-0.5',
                          index === activeMenuIndex
                            ? 'border-purple-400/40 bg-white/10 shadow-lg shadow-purple-500/20 aurora-pulse-ring aurora-shimmer'
                            : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="aurora-label text-white font-semibold">{item.label}</div>
                            <div className="aurora-label text-xs text-purple-200/70">{item.description}</div>
                          </div>
                          <span className="aurora-label text-purple-200/70">&gt;</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div>
                        <div className="aurora-label tracking-[0.3em] text-purple-200/70">Gateway Preview</div>
                        <div className="aurora-label text-2xl font-semibold text-white mt-2">
                          {activeMenu?.label ?? 'Aurora'} Universe
                        </div>
                        <p className="aurora-label text-sm text-purple-200/80 mt-2 max-w-xl">
                          {activeMenu?.description ?? 'Step into your next digital frontier.'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Link href={activeMenu?.href ?? '/home'}>
                          <Button variant="aurora" size="sm" className="life-gateway-button">
                            Enter {activeMenu?.label ?? 'Aurora'}
                          </Button>
                        </Link>
                        <Link href="/realms">
                          <Button variant="auroraSecondary" size="sm" className="life-gateway-button">
                            View All Universes
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(activeMenu?.children ?? []).map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="life-gateway-button group p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:translate-x-0.5"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="aurora-label text-white font-medium group-hover:text-white">{child.label}</div>
                              <div className="aurora-label text-xs text-purple-200/70 mt-1">{child.description}</div>
                            </div>
                            <span className="aurora-label text-purple-200/70">&gt;</span>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="aurora-label mt-6 flex flex-wrap items-center gap-4 text-xs text-purple-200/70">
                      <span className="aurora-label tracking-[0.3em] text-purple-200/70">15 Universes</span>
                      <span className="aurora-label tracking-[0.3em] text-purple-200/70">Unified Identity</span>
                      <span className="aurora-label tracking-[0.3em] text-purple-200/70">Instant Teleport</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <div className={clsx(
            'text-center space-y-8 max-w-6xl mx-auto',
            'transition-all duration-1000',
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          )}>
            {/* Main Title */}
            <div className="aurora-coverpage-title-group space-y-2">
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter">
                <span className="relative inline-block">
                  <span className="absolute top-[6px] md:top-[2px] left-[34%] -translate-x-1/2 translate-x-[6px] text-[14px] uppercase tracking-[0.4em] border border-white/10 bg-white/5 px-2 py-0.5 rounded-full shadow-sm shadow-purple-500/20 aurora-udc-badge">
                    <span className="aurora-udc-letter">U</span>
                    <span className="aurora-udc-letter">D</span>
                    <span className="aurora-udc-letter">C</span>
                  </span>
                  <span className="aurora-text-shimmer">
                    AURORA
                  </span>
                </span>
              </h1>
              <p className="aurora-label text-2xl md:text-4xl font-light text-white/90 tracking-wide">
                Your <span className="aurora-text aurora-text-semibold">Unified</span> Digital Civilization
              </p>
              <p className="aurora-label text-lg md:text-xl text-purple-300/80 max-w-3xl mx-auto leading-relaxed">
                Experience the future of digital living. 15 interconnected universes, one seamless reality. 
                Welcome to the next evolution of the internet.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <AuroraLogo size={36} interactive={false} showNav={false} />
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConcept('core')}
                    className={clsx(
                      'aurora-label text-xs px-2 py-1 rounded-full transition-colors',
                      concept === 'core'
                        ? 'bg-blue-500/20 text-blue-100'
                        : 'text-white/60'
                    )}
                  >
                    Concept 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setConcept('wave')}
                    className={clsx(
                      'aurora-label text-xs px-2 py-1 rounded-full transition-colors',
                      concept === 'wave'
                        ? 'bg-purple-500/20 text-purple-100'
                        : 'text-white/60'
                    )}
                  >
                    Concept 2
                  </button>
                </div>
                <div className="flex sm:hidden items-center gap-1 rounded-full border border-white/10 bg-white/10 px-1.5 py-1 text-[0.6rem]">
                  <button
                    type="button"
                    aria-label="Use logo concept 1"
                    onClick={() => setConcept('core')}
                    className={clsx(
                      'h-5 w-5 rounded-full transition-colors',
                      concept === 'core'
                        ? 'bg-blue-400/70 ring-2 ring-blue-300/60'
                        : 'bg-white/30'
                    )}
                  />
                  <button
                    type="button"
                    aria-label="Use logo concept 2"
                    onClick={() => setConcept('wave')}
                    className={clsx(
                      'h-5 w-5 rounded-full transition-colors',
                      concept === 'wave'
                        ? 'bg-purple-400/70 ring-2 ring-purple-300/60'
                        : 'bg-white/30'
                    )}
                  />
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/home">
                <Button variant="aurora" size="lg">
                  Enter Aurora ✨
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="auroraSecondary" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Universe Portals Grid */}
          <div className={clsx(
            'grid grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-20',
            'transition-all duration-1000 delay-300',
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          )}>
            {universes.map((universe, index) => (
              <Link
                key={universe.name}
                href={universe.href}
                onMouseEnter={() => setHoveredUniverse(universe.name)}
                onMouseLeave={() => setHoveredUniverse(null)}
                className={clsx(
                  'group relative p-6 rounded-2xl',
                  'bg-white/5 backdrop-blur-sm',
                  'border border-white/10',
                  'hover:border-white/30',
                  'transform transition-all duration-500',
                  'hover:scale-105 hover:-translate-y-2',
                  'cursor-pointer'
                )}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                {/* Gradient Background on Hover */}
                <div className={clsx(
                  'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0',
                  'group-hover:opacity-10 transition-opacity duration-500',
                  universe.color
                )} />
                
                {/* Content */}
                <div className="relative space-y-3">
                  {/* Icon */}
                  <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
                    {universe.icon}
                  </div>
                  
                  {/* Name */}
                  <h3 className="aurora-label text-xl font-bold text-white">
                    {universe.name}
                  </h3>
                  
                  {/* Tagline */}
                  <p className="aurora-label text-sm text-purple-300/80">
                    {universe.tagline}
                  </p>
                  
                  {/* Description - Shows on Hover */}
                  <p className={clsx(
                    'aurora-label text-xs text-white/60',
                    'opacity-0 group-hover:opacity-100',
                    'max-h-0 group-hover:max-h-20',
                    'transition-all duration-300'
                  )}>
                    {universe.description}
                  </p>

                  {/* Glow Effect */}
                  <div className={clsx(
                    'absolute -inset-1 rounded-2xl bg-gradient-to-br opacity-0',
                    'group-hover:opacity-20 blur-xl transition-opacity duration-500',
                    universe.color
                  )} />
                </div>

                {/* Arrow Icon */}
                <div className={clsx(
                  'aurora-label absolute top-4 right-4 text-white/40',
                  'transform translate-x-0 group-hover:translate-x-1',
                  'opacity-0 group-hover:opacity-100',
                  'transition-all duration-300'
                )}>
                  →
                </div>
              </Link>
            ))}
          </div>

          {/* Features Showcase */}
          <div className={clsx(
            'mt-32 max-w-6xl mx-auto',
            'transition-all duration-1000 delay-500',
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          )}>
            <div className="text-center mb-12">
              <h2 className="aurora-label text-3xl md:text-5xl font-bold text-white mb-4">
                Powered by <span className="aurora-text-warm">Advanced AI</span>
              </h2>
              <p className="aurora-label text-purple-300/80 text-lg">
                Experience the next generation of digital intelligence
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="aurora-label text-xl font-bold text-white">AI Companion</h3>
                <p className="aurora-label text-purple-300/70 text-sm">
                  Your personal assistant that learns and adapts to your preferences across all universes
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-3xl">🔗</span>
                </div>
                <h3 className="aurora-label text-xl font-bold text-white">Unified Experience</h3>
                <p className="aurora-label text-purple-300/70 text-sm">
                  Seamlessly connect all your digital activities in one coherent ecosystem
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <span className="text-3xl">🔒</span>
                </div>
                <h3 className="aurora-label text-xl font-bold text-white">Privacy First</h3>
                <p className="aurora-label text-purple-300/70 text-sm">
                  Your data, your control. Built with ethical AI and zero-knowledge architecture
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-center">
                <div className="text-4xl font-bold aurora-text-warm">
                  15
                </div>
                <div className="aurora-label text-sm text-purple-300/70 mt-2">Universes</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold aurora-text-cool">
                  ∞
                </div>
                <div className="aurora-label text-sm text-purple-300/70 mt-2">Possibilities</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold aurora-text-nature">
                  100%
                </div>
                <div className="aurora-label text-sm text-purple-300/70 mt-2">Open</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold aurora-text-warm">
                  24/7
                </div>
                <div className="aurora-label text-sm text-purple-300/70 mt-2">Active</div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center">
          <div className="aurora-label flex flex-wrap justify-center gap-6 text-sm text-purple-300/60">
            <Link href="/about" className="aurora-label hover:text-purple-300 transition-colors">
              About
            </Link>
            <Link href="/roadmap" className="aurora-label hover:text-purple-300 transition-colors">
              Roadmap
            </Link>
            <Link href="/developer" className="aurora-label hover:text-purple-300 transition-colors">
              Developer
            </Link>
            <Link href="/legal" className="aurora-label hover:text-purple-300 transition-colors">
              Legal
            </Link>
            <Link href="/contact" className="aurora-label hover:text-purple-300 transition-colors">
              Contact
            </Link>
          </div>
          <div className="aurora-label mt-4 text-xs text-purple-400/40">
            © 2026 Aurora. The Future of Digital Civilization.
          </div>
        </footer>
      </div>

      {/* Additional Styles */}
      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translate3d(0, -100%, 0);
          }
          100% {
            transform: translate3d(0, 100vh, 0);
          }
        }
        .animate-scan {
          animation: scan 8s linear infinite;
          will-change: transform;
        }
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
          will-change: background-position;
        }
        @keyframes float {
          0% {
            transform: translate3d(0, 100vh, 0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--float-x, 0px), -100px, 0) scale(1);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
          will-change: transform, opacity;
        }
        @keyframes gateway-breathe {
          0% {
            transform: scale3d(1, 1, 1);
            box-shadow: 0 0 0 rgba(168, 85, 247, 0);
          }
          50% {
            transform: scale3d(1.4, 1.4, 1);
            box-shadow: 0 0 28px rgba(168, 85, 247, 0.35);
          }
            100% {
            transform: scale3d(1.9, 1.9, 1);
            box-shadow: 0 0 18px rgba(168, 85, 247, 0.35);
          }
        }
        .animate-gateway-breathe {
          animation: gateway-breathe 2.6s ease-in-out infinite;
          will-change: transform, box-shadow;
        }
        @keyframes udc-breathe {
          0% {
            transform: translate3d(6px, 0, 0) scale3d(0.94, 0.94, 1);
            border-color: rgba(139, 92, 246, 0.35);
            background-color: rgba(139, 92, 246, 0.08);
            box-shadow: 0 0 6px rgba(139, 92, 246, 0.25);
          }
          33% {
            transform: translate3d(6px, 0, 0) scale3d(1.14, 1.14, 1);
            border-color: rgba(59, 130, 246, 0.4);
            background-color: rgba(59, 130, 246, 0.1);
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.35);
          }
          66% {
            transform: translate3d(6px, 0, 0) scale3d(1.06, 1.06, 1);
            border-color: rgba(236, 72, 153, 0.4);
            background-color: rgba(236, 72, 153, 0.1);
            box-shadow: 0 0 10px rgba(236, 72, 153, 0.35);
          }
        }
        .aurora-udc-badge {
          animation: udc-breathe 1.8s ease-in-out infinite !important;
          text-shadow: 0 0 18px rgba(139, 92, 246, 0.7);
          filter: drop-shadow(0 0 14px rgba(236, 72, 153, 0.55));
          will-change: transform, filter;
        }
        @keyframes udc-letter-shift {
          0%, 100% {
            color: rgba(216, 180, 254, 1);
          }
          33% {
            color: rgba(56, 189, 248, 1);
          }
          66% {
            color: rgba(244, 114, 182, 1);
          }
        }
        .aurora-udc-letter {
          display: inline-block;
          animation: udc-letter-shift 1.1s ease-in-out infinite !important;
          text-shadow: 0 0 14px currentColor;
          will-change: color;
        }
        .aurora-udc-letter:nth-child(1) {
          animation-delay: 0s;
        }
        .aurora-udc-letter:nth-child(2) {
          animation-delay: 0.3s;
        }
        .aurora-udc-letter:nth-child(3) {
          animation-delay: 0.6s;
        }
        @media (prefers-reduced-motion: reduce) {
          .aurora-coverpage-title-group,
          .aurora-udc-badge,
          .aurora-udc-letter {
            animation-duration: 1.2s !important;
            animation-iteration-count: infinite !important;
          }
        }
        @keyframes aurora-pulse-ring {
          0%, 100% {
            box-shadow: 0 0 0 rgba(168, 85, 247, 0.0), 0 0 0 rgba(59, 130, 246, 0.0);
          }
          50% {
            box-shadow: 0 0 24px rgba(168, 85, 247, 0.35), 0 0 36px rgba(59, 130, 246, 0.2);
          }
        }
        .aurora-pulse-ring {
          animation: aurora-pulse-ring 2.2s ease-in-out infinite;
          will-change: box-shadow;
        }
        @keyframes aurora-shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .aurora-shimmer {
          position: relative;
          overflow: hidden;
        }
        .aurora-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 10%, rgba(255, 255, 255, 0.25) 35%, transparent 60%);
          background-size: 200% 100%;
          animation: aurora-shimmer 2.8s ease-in-out infinite;
          opacity: 0.9;
          pointer-events: none;
          mix-blend-mode: screen;
          will-change: background-position, opacity;
        }
        .life-gateway-backdrop {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.9;
        }
        .life-gateway-ambient {
          position: absolute;
          inset: -50% -10% -50% -10%;
          background: conic-gradient(
            from 110deg,
            rgba(139, 92, 246, 0.3),
            rgba(59, 130, 246, 0.28),
            rgba(236, 72, 153, 0.26),
            rgba(139, 92, 246, 0.3)
          );
          filter: blur(60px);
          animation: life-gateway-hue 10s linear infinite,
            life-gateway-breathe 4.4s ease-in-out infinite;
          will-change: transform, opacity, filter;
        }
        .life-gateway-glaze {
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(255, 255, 255, 0.12), transparent 45%, rgba(255, 255, 255, 0.1));
          mix-blend-mode: screen;
          animation: life-gateway-glaze 3.2s ease-in-out infinite;
          will-change: opacity;
        }
        .life-gateway-button {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }
        .life-gateway-button::before {
          content: '';
          position: absolute;
          inset: -60% -20% -60% -20%;
          background: conic-gradient(
            from 120deg,
            rgba(139, 92, 246, 0.25),
            rgba(59, 130, 246, 0.22),
            rgba(236, 72, 153, 0.2),
            rgba(139, 92, 246, 0.25)
          );
          opacity: 0.65;
          filter: blur(30px);
          animation: life-gateway-button-hue 8s linear infinite,
            life-gateway-button-breathe 4s ease-in-out infinite;
          z-index: 0;
          will-change: transform, opacity, filter;
        }
        .life-gateway-button::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(255, 255, 255, 0.12), transparent 45%, rgba(255, 255, 255, 0.08));
          mix-blend-mode: screen;
          opacity: 0.35;
          animation: life-gateway-button-glaze 3.1s ease-in-out infinite;
          z-index: 0;
          will-change: opacity;
        }
        .life-gateway-button > * {
          position: relative;
          z-index: 1;
        }
        @keyframes life-gateway-button-hue {
          0% {
            filter: blur(30px) hue-rotate(0deg);
          }
          100% {
            filter: blur(30px) hue-rotate(360deg);
          }
        }
        @keyframes life-gateway-button-breathe {
          0%, 100% {
            transform: scale3d(0.98, 0.98, 1);
            opacity: 0.45;
          }
          50% {
            transform: scale3d(1.06, 1.06, 1);
            opacity: 0.75;
          }
        }
        @keyframes life-gateway-button-glaze {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.6;
          }
        }
        @keyframes life-gateway-hue {
          0% {
            filter: blur(60px) hue-rotate(0deg);
          }
          100% {
            filter: blur(60px) hue-rotate(360deg);
          }
        }
        @keyframes life-gateway-breathe {
          0%, 100% {
            transform: scale3d(0.98, 0.98, 1);
            opacity: 0.6;
          }
          50% {
            transform: scale3d(1.06, 1.06, 1);
            opacity: 0.95;
          }
        }
        @keyframes life-gateway-glaze {
          0%, 100% {
            opacity: 0.25;
          }
          50% {
            opacity: 0.7;
          }
        }
        @keyframes aurora-title-float {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale3d(0.98, 0.98, 1);
          }
          50% {
            transform: translate3d(0, -10px, 0) scale3d(1.06, 1.06, 1);
          }
        }
        @keyframes aurora-title-glow {
          0%, 100% {
            filter: drop-shadow(0 0 0 rgba(168, 85, 247, 0.0));
          }
          50% {
            filter: drop-shadow(0 0 28px rgba(168, 85, 247, 0.55));
          }
        }
        .aurora-coverpage-title-group {
          animation: aurora-title-float 4.8s ease-in-out infinite !important,
            aurora-title-glow 3.4s ease-in-out infinite !important;
          will-change: transform, filter;
        }
        .aurora-gateway-logo {
          position: relative;
          width: min(520px, 90vw);
          height: min(520px, 90vw);
          display: grid;
          place-items: center;
          border-radius: 50%;
          overflow: hidden;
          background: radial-gradient(circle at 20% 20%, rgba(76, 29, 149, 0.35), transparent 55%),
            radial-gradient(circle at 80% 30%, rgba(59, 130, 246, 0.25), transparent 60%),
            rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 40px rgba(168, 85, 247, 0.5), 0 0 120px rgba(59, 130, 246, 0.35);
          animation: aurora-gateway-float 5.2s ease-in-out infinite;
          will-change: transform, box-shadow;
        }
        .aurora-gateway-logo:hover {
          box-shadow: 0 0 60px rgba(236, 72, 153, 0.6), 0 0 160px rgba(59, 130, 246, 0.45);
        }
        .aurora-gateway-core {
          position: absolute;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.6), rgba(59, 130, 246, 0.2) 55%, rgba(15, 23, 42, 0.9) 100%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 45px rgba(168, 85, 247, 0.6), 0 0 120px rgba(59, 130, 246, 0.35);
          display: grid;
          place-items: center;
          animation: aurora-core-pulse 3.6s ease-in-out infinite;
          z-index: 10;
          will-change: transform, box-shadow;
        }
        .aurora-gateway-core-inner {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.2), rgba(15, 23, 42, 0.85) 70%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: grid;
          place-items: center;
          text-align: center;
          padding: 18px;
        }
        .aurora-gateway-core-icon {
          font-size: 46px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.95);
          text-shadow: 0 0 18px rgba(168, 85, 247, 0.6);
        }
        .aurora-gateway-core-label {
          margin-top: 10px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: rgba(226, 232, 240, 0.7);
        }
        .aurora-orbit-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          display: block;
        }
        .aurora-orbit-ring--primary {
          animation: aurora-orbit-spin 28s linear infinite;
          will-change: transform;
        }
        .aurora-orbit-ring--secondary {
          inset: 40px;
          animation: aurora-orbit-spin-reverse 34s linear infinite;
          will-change: transform;
        }
        .aurora-orbit-item {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: rotate(calc(360deg * var(--orbit-index) / var(--orbit-count))) translateX(220px);
          transform-origin: 0 0;
          animation: aurora-orbit-item-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
          animation-delay: var(--orbit-stagger);
          will-change: transform, opacity;
        }
        .aurora-orbit-item--sub {
          transform: rotate(calc(360deg * var(--orbit-index) / var(--orbit-count))) translateX(150px);
        }
        .aurora-orbit-icon {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.16);
          box-shadow: 0 0 12px rgba(168, 85, 247, 0.4);
          animation: aurora-icon-glide 12s ease-in-out infinite;
          transition: transform 220ms ease, box-shadow 220ms ease, background 220ms ease;
          font-size: 0;
          cursor: pointer;
          padding: 0;
          color: currentColor;
          will-change: transform, box-shadow;
        }
        .aurora-orbit-icon--interactive {
          cursor: pointer;
          outline: none;
        }
        .aurora-orbit-icon--interactive:hover {
          transform: scale(1.15);
          box-shadow: 0 0 24px rgba(236, 72, 153, 0.7), 0 0 36px rgba(236, 72, 153, 0.4);
          background: rgba(236, 72, 153, 0.15);
        }
        .aurora-orbit-icon--interactive:focus-visible {
          outline: 2px solid rgba(168, 85, 247, 0.8);
          outline-offset: 4px;
        }
        .aurora-orbit-icon--interactive:active {
          transform: scale(0.95);
        }
        .aurora-orbit-icon--small {
          width: 32px;
          height: 32px;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.35);
        }
        .aurora-orbit-icon--small:hover {
          transform: scale(1.18);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
        }
        .aurora-orbit-icon-label {
          position: absolute;
          bottom: -28px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          font-size: 10px;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.75);
          opacity: 0;
          pointer-events: none;
          transition: opacity 220ms ease;
          text-transform: capitalize;
          letter-spacing: 0.02em;
        }
        .aurora-orbit-icon--interactive:hover .aurora-orbit-icon-label {
          opacity: 1;
        }
        .aurora-orbit-icon-label--small {
          font-size: 8px;
          bottom: -22px;
        }
        @keyframes aurora-orbit-item-enter {
          0% {
            opacity: 0;
            transform: rotate(calc(360deg * var(--orbit-index) / var(--orbit-count))) translate3d(0, 0, 0) scale3d(0.6, 0.6, 1);
          }
          100% {
            opacity: 1;
            transform: rotate(calc(360deg * var(--orbit-index) / var(--orbit-count))) translate3d(220px, 0, 0) scale3d(1, 1, 1);
          }
        }
        @keyframes aurora-icon-glide {
          0%, 100% {
            filter: brightness(1);
            transform: scale3d(1, 1, 1);
          }
          50% {
            filter: brightness(1.1);
            transform: scale3d(1.04, 1.04, 1);
          }
        }
        @keyframes aurora-orbit-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes aurora-orbit-spin-reverse {
          0% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        @keyframes aurora-core-pulse {
          0%, 100% {
            transform: scale3d(1, 1, 1);
            box-shadow: 0 0 45px rgba(168, 85, 247, 0.6), 0 0 120px rgba(59, 130, 246, 0.35);
          }
          50% {
            transform: scale3d(1.02, 1.02, 1);
            box-shadow: 0 0 60px rgba(236, 72, 153, 0.7), 0 0 140px rgba(59, 130, 246, 0.45);
          }
        }
        @keyframes aurora-gateway-float {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, 8px, 0);
          }
        }
      `}</style>
    </div>
  );
}
