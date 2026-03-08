import type { Metadata } from 'next';
import { ThemeProvider } from '@/lib/design-system/theme-provider';
import { AccessibilityProvider } from '@/lib/accessibility/accessibility-provider';
import { RealtimeProvider } from '@/lib/realtime/realtime-provider';
import { CompanionProvider } from '@/lib/companion/companion-provider';
import { CompanionContextEngineProvider } from '@/lib/companion/companion-context-engine';
import { AuroraLogoProvider } from '@/lib/brand/aurora-logo-provider';
import { MemoryProvider } from '@/lib/memory/memory-provider';
import { AuthSessionProvider } from '@/components/auth/SessionProvider';
import { AuthSessionHealthBadge } from '@/components/auth/AuthSessionHealthBadge';
import { SkipLinks } from '@/components/accessibility/SkipLinks';
import { AutoFocusManager } from '@/components/accessibility/AutoFocusManager';
import { MemoryTracker } from '@/components/aurora/MemoryTracker';
import { CompanionPanel } from '@/components/aurora/CompanionPanel';
import { RealtimeToasts } from '@/components/aurora/RealtimeToasts';
import { CompanionHint } from '@/components/aurora/CompanionHint';
import { MotionGate } from '@/components/aurora/MotionGate';
import { auth } from '@/lib/auth';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aurora - Your Digital Civilization',
  description:
    'A calm, beautifully designed digital world for your creative life. Aurora brings clarity, inspiration, and emotional resonance to everything you create. One place for your ideas, projects, and creativity.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply theme before rendering to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const migrationKey = 'aurora-theme-migrated-text30-v1';
                if (!localStorage.getItem(migrationKey)) {
                  localStorage.setItem('aurora-theme-mode', 'text30');
                  localStorage.setItem(migrationKey, 'true');
                }

                const mode = localStorage.getItem('aurora-theme-mode') || 'text30';
                const family = localStorage.getItem('aurora-theme-family') || 'home';
                const html = document.documentElement;
                
                if (mode === 'system') {
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (prefersDark) html.classList.add('dark');
                } else if (mode === 'illuminated') {
                  html.classList.add('dark', 'illuminated');
                } else if (mode === 'text30') {
                  html.classList.add('dark', 'theme-text30');
                } else if (mode === 'dark') {
                  html.classList.add('dark');
                }
                
                html.classList.add('theme-' + family);
                
                // Apply accessibility settings
                const a11y = localStorage.getItem('aurora-accessibility');
                if (a11y) {
                  const settings = JSON.parse(a11y);
                  if (settings.highContrast) html.classList.add('high-contrast');
                  if (settings.reducedMotion) html.classList.add('reduce-motion');
                  if (settings.largeText) html.classList.add('large-text');
                  if (settings.keyboardNav) html.classList.add('keyboard-nav');
                  if (settings.screenReaderMode) html.classList.add('screen-reader');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="aurora-label bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased">
        <div className="aurora-global-overlay" aria-hidden="true">
          <div className="aurora-global-life">
            <div className="life-ambient" />
            <div className="life-glaze" />
            <div className="life-core">
              <div className="life-core-orb" />
              <div className="life-core-ring" />
              <div className="life-core-text">Life</div>
            </div>
          </div>
        </div>
        <MotionGate />
        <AuthSessionProvider session={session}>
          <ThemeProvider>
            <AccessibilityProvider>
              <RealtimeProvider>
                <MemoryProvider>
                  <CompanionProvider>
                    <CompanionContextEngineProvider>
                      <AuroraLogoProvider>
                        <SkipLinks />
                        <AutoFocusManager />
                        {children}
                        <MemoryTracker />
                        <CompanionPanel />
                        <CompanionHint />
                        <AuthSessionHealthBadge />
                        <RealtimeToasts />
                      </AuroraLogoProvider>
                    </CompanionContextEngineProvider>
                  </CompanionProvider>
                </MemoryProvider>
              </RealtimeProvider>
            </AccessibilityProvider>
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}