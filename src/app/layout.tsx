import type { Metadata } from 'next';
import { ThemeProvider } from '@/lib/design-system/theme-provider';
import { AccessibilityProvider } from '@/lib/accessibility/accessibility-provider';
import { RealtimeProvider } from '@/lib/realtime/realtime-provider';
import { SkipLinks } from '@/components/accessibility/SkipLinks';
import { RealtimeToasts } from '@/components/aurora/RealtimeToasts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aurora - Your Digital Civilization',
  description: 'A calm, beautifully designed digital world for your creative life.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply theme before rendering to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const mode = localStorage.getItem('aurora-theme-mode') || 'system';
                const family = localStorage.getItem('aurora-theme-family') || 'home';
                const html = document.documentElement;
                
                if (mode === 'system') {
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (prefersDark) html.classList.add('dark');
                } else if (mode === 'illuminated') {
                  html.classList.add('dark', 'illuminated');
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
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased">
        <ThemeProvider>
          <AccessibilityProvider>
            <RealtimeProvider>
              <SkipLinks />
              {children}
              <RealtimeToasts />
            </RealtimeProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}