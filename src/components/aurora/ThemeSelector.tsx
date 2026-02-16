'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/lib/design-system/theme-provider';
import type { ThemeMode, ThemeFamily } from '@/lib/design-system/tokens';
import clsx from 'clsx';

const modes: Array<{ value: ThemeMode; label: string; icon: string }> = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'illuminated', label: 'Illuminated', icon: '✨' },
  { value: 'system', label: 'System', icon: '⚙️' },
];

const families: Array<{ value: ThemeFamily; label: string; description: string; color: string }> = [
  { value: 'home', label: 'Home', description: 'Warm', color: '#0084ff' },
  { value: 'office', label: 'Office', description: 'Professional', color: '#0070e6' },
  { value: 'outdoor', label: 'Outdoor', description: 'Natural', color: '#059669' },
  { value: 'lifestyle', label: 'Lifestyle', description: 'Vibrant', color: '#ec4899' },
  { value: 'creative', label: 'Creative', description: 'Expressive', color: '#a855f7' },
];

interface ThemeSelectorProps {
  showLabel?: boolean;
  variant?: 'compact' | 'expanded';
}

export function ThemeSelector({ showLabel = true, variant = 'compact' }: ThemeSelectorProps) {
  const { mode, family, setMode, setFamily } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isVeilEnabled, setIsVeilEnabled] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const storedValue = window.localStorage.getItem('aurora-veil-typography');
    if (storedValue === 'true') {
      setIsVeilEnabled(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('aurora-veil-enabled', isVeilEnabled);
    window.localStorage.setItem('aurora-veil-typography', String(isVeilEnabled));
  }, [isVeilEnabled]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  if (variant === 'expanded') {
    return (
      <div className="space-y-8 py-4">
        {/* Theme Mode Section */}
        <div className="space-y-4">
          {showLabel && (
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <span className="text-lg">🎨</span> Theme Mode
            </h3>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {modes.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={clsx(
                  'group relative p-4 rounded-xl transition-all duration-300',
                  'border border-transparent',
                  mode === m.value
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg dark:shadow-blue-900/50 ring-2 ring-blue-400 dark:ring-blue-500'
                    : 'bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-50 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
                )}
              >
                <div className="text-3xl mb-2 transform transition-transform group-hover:scale-110">
                  {m.icon}
                </div>
                <p className="text-xs font-semibold">{m.label}</p>
                {mode === m.value && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Family Section */}
        <div className="space-y-4">
          {showLabel && (
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <span className="text-lg">🎭</span> Theme Family
            </h3>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">

        {/* Typography Section */}
        <div className="space-y-4">
          {showLabel && (
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <span className="text-lg">🫧</span> Typography
            </h3>
          )}
          <button
            type="button"
            onClick={() => setIsVeilEnabled((prev) => !prev)}
            aria-pressed={isVeilEnabled}
            className={clsx(
              'flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-300',
              'border border-slate-200 dark:border-slate-800',
              isVeilEnabled
                ? 'bg-blue-500/10 text-blue-700 dark:text-blue-200 border-blue-400/60'
                : 'bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300'
            )}
          >
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Aurora Veil</span>
                {isVeilEnabled && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    Active
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">90% fill + blur(5px) backdrop</div>
            </div>
            <span
              aria-hidden="true"
              className={clsx(
                'h-6 w-11 rounded-full p-1 transition-colors duration-300',
                isVeilEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              )}
            >
              <span
                className={clsx(
                  'block h-4 w-4 rounded-full bg-white transition-transform duration-300',
                  isVeilEnabled ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </span>
          </button>
        </div>
            {families.map((f) => (
              <button
                key={f.value}
                onClick={() => setFamily(f.value)}
                className={clsx(
                  'group relative p-4 rounded-xl transition-all duration-300',
                  'border border-transparent text-center',
                  family === f.value
                    ? 'ring-2 ring-offset-2 dark:ring-offset-slate-950 text-white shadow-lg'
                    : 'bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                )}
                style={
                  family === f.value
                    ? {
                        background: `linear-gradient(135deg, ${f.color}dd, ${f.color})`,
                        boxShadow: `0 0 20px ${f.color}40, 0 4px 15px rgba(0,0,0,0.2)`,
                      }
                    : {}
                }
              >
                <div
                  className="w-3 h-3 rounded-full mb-2 mx-auto"
                  style={{
                    backgroundColor: f.color,
                    opacity: family === f.value ? 1 : 0.5,
                  }}
                />
                <p className="text-xs font-semibold">{f.label}</p>
                <p className={clsx('text-xs mt-1', family === f.value ? 'text-white/80' : 'text-slate-500 dark:text-slate-400')}>
                  {f.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Collapsible Compact variant for navbar
  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          'transition-all duration-300 ease-out',
          isOpen
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 bg-slate-50/50 dark:bg-slate-900/30',
          'border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600'
        )}
        title="Theme & Mode"
      >
        <span className="text-lg">🎨</span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className={clsx(
            'aurora-menu-panel aurora-menu-panel--clear absolute right-0 top-full mt-3 w-80 rounded-xl',
            'border border-slate-200 dark:border-slate-800',
            'shadow-2xl dark:shadow-2xl',
            'z-[9999] overflow-hidden',
            'animate-slide-in-down duration-300'
          )}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Appearance Settings
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-5">
            {/* Mode Selection */}
            <div className="space-y-2">
              <label className="aurora-label text-slate-500 dark:text-slate-500">
                💡 Mode
              </label>
              <div className="grid grid-cols-4 gap-2">
                {modes.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => {
                      setMode(m.value);
                      setIsOpen(false);
                    }}
                    className={clsx(
                      'py-2 px-2 rounded-lg transition-all duration-200 text-sm font-medium',
                      'flex flex-col items-center gap-1',
                      mode === m.value
                        ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400 dark:ring-blue-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    )}
                    title={m.label}
                  >
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-xs">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Selection */}
            <div className="space-y-2">
              <label className="aurora-label text-slate-500 dark:text-slate-500">
                🫧 Typography
              </label>
              <button
                type="button"
                onClick={() => setIsVeilEnabled((prev) => !prev)}
                aria-pressed={isVeilEnabled}
                className={clsx(
                  'flex items-center justify-between w-full px-3 py-2 rounded-lg transition-all duration-200',
                  'border border-slate-200 dark:border-slate-800',
                  isVeilEnabled
                    ? 'bg-blue-500/10 text-blue-700 dark:text-blue-200 border-blue-400/60'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                )}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  Aurora Veil
                  {isVeilEnabled && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-600 text-white">
                      Active
                    </span>
                  )}
                </span>
                <span
                  aria-hidden="true"
                  className={clsx(
                    'h-5 w-9 rounded-full p-1 transition-colors duration-200',
                    isVeilEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                  )}
                >
                  <span
                    className={clsx(
                      'block h-3 w-3 rounded-full bg-white transition-transform duration-200',
                      isVeilEnabled ? 'translate-x-4' : 'translate-x-0'
                    )}
                  />
                </span>
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                90% fill transparency + blur(5px) backdrop
              </p>
            </div>

            {/* Family Selection */}
            <div className="space-y-2">
              <label className="aurora-label text-slate-500 dark:text-slate-500">
                🎭 Family
              </label>
              <div className="grid grid-cols-5 gap-2">
                {families.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => {
                      setFamily(f.value);
                      setIsOpen(false);
                    }}
                    className={clsx(
                      'py-2 px-1 rounded-lg transition-all duration-200',
                      'flex flex-col items-center gap-1 text-xs font-medium',
                      family === f.value
                        ? 'text-white shadow-lg ring-2 ring-offset-2 dark:ring-offset-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    )}
                    style={
                      family === f.value
                        ? {
                            background: `linear-gradient(135deg, ${f.color}dd, ${f.color})`,
                            boxShadow: `0 0 15px ${f.color}40, 0 4px 12px rgba(0,0,0,0.2)`,
                          }
                        : {}
                    }
                    title={f.label}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: f.color }}
                    />
                    <span className={family === f.value ? 'text-white' : ''}>
                      {f.label[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Current: <span className="font-semibold capitalize">{mode}</span> mode, <span className="font-semibold capitalize">{family}</span> family
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
