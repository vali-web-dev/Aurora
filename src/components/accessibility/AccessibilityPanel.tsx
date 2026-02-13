'use client';

import { useAccessibility } from '@/lib/accessibility/accessibility-provider';
import { Card } from '@/components/aurora/Card';
import clsx from 'clsx';

interface AccessibilitySetting {
  key: keyof Omit<ReturnType<typeof useAccessibility>, 'setSetting' | 'announce'>;
  label: string;
  description: string;
  icon: string;
}

const settings: AccessibilitySetting[] = [
  {
    key: 'highContrast',
    label: 'High Contrast',
    description: 'Increase color contrast for better visibility',
    icon: '⚫⚪',
  },
  {
    key: 'reducedMotion',
    label: 'Reduced Motion',
    description: 'Minimize animations and transitions',
    icon: '🔇',
  },
  {
    key: 'largeText',
    label: 'Large Text',
    description: 'Increase font sizes across the interface',
    icon: '🔠',
  },
  {
    key: 'keyboardNav',
    label: 'Keyboard Navigation',
    description: 'Enhanced focus indicators for keyboard users',
    icon: '⌨️',
  },
  {
    key: 'screenReaderMode',
    label: 'Screen Reader Mode',
    description: 'Optimize for screen reader compatibility',
    icon: '🔊',
  },
];

type AccessibilityPanelProps = {
  showHeader?: boolean;
};

export function AccessibilityPanel({ showHeader = true }: AccessibilityPanelProps) {
  const accessibility = useAccessibility();

  const handleToggle = (key: AccessibilitySetting['key']) => {
    accessibility.setSetting(key, !accessibility[key]);
    accessibility.announce(
      `${settings.find((s) => s.key === key)?.label} ${!accessibility[key] ? 'enabled' : 'disabled'}`,
      'polite'
    );
  };

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Accessibility Settings
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Customize Aurora to meet your accessibility needs. Changes are applied immediately.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settings.map((setting) => {
          const isEnabled = accessibility[setting.key];
          
          return (
            <Card key={setting.key} className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div
                    className={clsx(
                      'w-12 h-12 rounded-lg flex items-center justify-center text-2xl',
                      'transition-all duration-300',
                      isEnabled
                        ? 'bg-blue-100 dark:bg-blue-950 ring-2 ring-blue-500'
                        : 'bg-slate-100 dark:bg-slate-800'
                    )}
                  >
                    {setting.icon}
                  </div>
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                        {setting.label}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {setting.description}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleToggle(setting.key)}
                      role="switch"
                      aria-checked={isEnabled}
                      aria-label={`Toggle ${setting.label}`}
                      className={clsx(
                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full',
                        'transition-colors duration-200 ease-in-out',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        isEnabled
                          ? 'bg-blue-600'
                          : 'bg-slate-300 dark:bg-slate-700'
                      )}
                    >
                      <span
                        className={clsx(
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full',
                          'bg-white shadow ring-0 transition duration-200 ease-in-out',
                          isEnabled ? 'translate-x-5' : 'translate-x-0.5'
                        )}
                        style={{ marginTop: '2px' }}
                      />
                    </button>
                  </div>
                  
                  {isEnabled && (
                    <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                      ✓ Enabled
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
        <div className="flex items-start gap-3">
          <div className="text-2xl">ℹ️</div>
          <div className="space-y-2">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              About Aurora's Accessibility
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Aurora is designed to meet WCAG 2.1 AA+ standards. We support keyboard navigation,
              screen readers, high contrast modes, and customizable text sizes. Your preferences
              are saved automatically.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded">
                WCAG 2.1 AA+
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded">
                Screen Reader Compatible
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded">
                Keyboard Navigation
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
