'use client';

import { useTheme } from '@/lib/design-system/theme-provider';
import { Button } from './Button';
import { useState } from 'react';

export function ThemeSwitcher() {
  const { mode, family, setMode, setFamily } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const modes = ['light', 'dark', 'illuminated', 'system'] as const;
  const families = ['home', 'office', 'outdoor', 'lifestyle', 'creative'] as const;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
        className="text-sm"
      >
        Theme ✨
      </Button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-4">
            {/* Mode */}
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
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
                    className={`text-xs py-1 px-2 rounded transition-colors ${
                      mode === m
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {m === 'system' ? '🖥️' : m === 'light' ? '☀️' : m === 'dark' ? '🌙' : '✨'}
                    {' '}
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Family */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
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
                    className={`w-full text-xs py-2 px-3 rounded text-left transition-colors ${
                      family === f
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 hover:bg-slate-200 dark:hover:bg-slate-700'
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
