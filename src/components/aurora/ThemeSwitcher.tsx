'use client';

import { useTheme } from '@/lib/design-system/theme-provider';
import { Button } from './Button';
import { useState } from 'react';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';

export function ThemeSwitcher() {
  const { mode, family, setMode, setFamily } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const modes = ['light', 'dark', 'illuminated', 'text30', 'system'] as const;
  const families = ['home', 'office', 'outdoor', 'lifestyle', 'creative'] as const;
  const modeBadge: Record<(typeof modes)[number], string> = {
    light: 'L',
    dark: 'D',
    illuminated: 'I',
    text30: 'T',
    system: 'S',
  };

  useBodyScrollLock(showMenu);

  return (
    <div className="relative">
      {showMenu && (
        <div
          className="fixed inset-0 z-[9998] bg-black/10"
          onClick={() => setShowMenu(false)}
          aria-hidden="true"
        />
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
        className="text-sm"
      >
        Theme
      </Button>

      {showMenu && (
        <div className="aurora-menu-panel aurora-menu-panel--clear absolute right-0 mt-2 w-56 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg p-4 z-[9999]">
          <div className="space-y-4">
            {/* Mode */}
            <div>
              <p className="aurora-label text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                Visual Mode
              </p>
              <div className="grid grid-cols-2 gap-2">
                {modes.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      setShowMenu(false);
                    }}
                    className={`aurora-label text-xs py-1 px-2 rounded transition-colors ${
                      mode === m
                        ? 'aurora-label bg-blue-600 text-white'
                        : 'aurora-label bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {modeBadge[m]}{' '}
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Family */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
              <p className="aurora-label text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                Theme Family
              </p>
              <div className="space-y-2">
                {families.map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFamily(f);
                      setShowMenu(false);
                    }}
                    className={`aurora-label w-full text-xs py-2 px-3 rounded text-left transition-colors ${
                      family === f
                        ? 'aurora-label bg-blue-600 text-white'
                        : 'aurora-label bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
