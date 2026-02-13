import Link from 'next/link';
import { footerNav } from '@/lib/navigation';

export function Footer() {
  return (
    <footer 
      id="footer"
      role="contentinfo" 
      className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
    >
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-[1fr,2fr]">
          {/* Brand section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600" />
              <span className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-50">
                Aurora
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs">
              A calm, beautifully designed digital world for your creative life.
            </p>
          </div>

          {/* Navigation columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(footerNav).map(([group, links]) => (
              <div key={group} className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-900 dark:text-slate-50 capitalize">
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