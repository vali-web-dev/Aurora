'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { footerNav } from '@/lib/navigation';
import { Button } from '@/components/aurora/Button';

export function Footer() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  return (
    <footer 
      id="footer"
      role="contentinfo" 
      className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
    >
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-[1fr,2fr]">
          {/* Brand section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600" />
              <span className="aurora-label text-slate-900 dark:text-slate-50">
                Aurora
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs">
              A calm, beautifully designed digital world for your creative life.
            </p>

            {/* Authentication Section */}
            {!isLoading && (
              <div className="pt-2 space-y-2">
                {!isAuthenticated ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <Link href="/auth/signin">
                      <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button variant="primary" size="sm" className="w-full sm:w-auto">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Signed in as <span className="font-medium text-slate-900 dark:text-slate-50">{session?.user?.email}</span>
                    </p>
                    <div className="flex flex-col gap-2">
                      <Link 
                        href="/dashboard"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        → Dashboard
                      </Link>
                      <Link 
                        href="/profile"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        → Profile
                      </Link>
                      <Link 
                        href="/settings"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        → Settings
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 text-left transition-colors"
                      >
                        → Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(footerNav).map(([group, links]) => (
              <div key={group} className="space-y-3">
                <p className="aurora-label text-slate-900 dark:text-slate-50 capitalize">
                  {group}
                </p>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-8">
          <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
            Aurora © 2026 · Clarity, beauty, integrity, humanity, wonder.
          </p>
        </div>
      </div>
    </footer>
  );
}