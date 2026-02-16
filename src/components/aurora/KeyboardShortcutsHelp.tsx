'use client';

import { AuroraModal } from '@/components/aurora/Modal';
import clsx from 'clsx';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  {
    category: 'Navigation',
    items: [
      { keys: ['Ctrl/Cmd', 'H'], description: 'Go to Home' },
      { keys: ['Ctrl/Cmd', 'Shift', 'L'], description: 'Go to Learning' },
      { keys: ['Ctrl/Cmd', 'Shift', 'F'], description: 'Go to Create' },
      { keys: ['Ctrl/Cmd', 'Shift', 'P'], description: 'Go to Productivity' },
    ],
  },
  {
    category: 'Actions',
    items: [
      { keys: ['Ctrl/Cmd', 'K'], description: 'Open Search' },
      { keys: ['Ctrl/Cmd', '/'], description: 'Open Documentation' },
      { keys: ['Ctrl/Cmd', 'B'], description: 'Toggle Companion Panel' },
      { keys: ['?'], description: 'Show this help' },
    ],
  },
  {
    category: 'General',
    items: [
      { keys: ['Esc'], description: 'Close modals and popups' },
      { keys: ['Tab'], description: 'Navigate between elements' },
      { keys: ['↑', '↓'], description: 'Navigate search results' },
      { keys: ['Enter'], description: 'Select/confirm' },
    ],
  },
];

export function KeyboardShortcutsHelp({
  isOpen,
  onOpenChange,
}: KeyboardShortcutsHelpProps) {
  return (
    <AuroraModal
      isOpen={isOpen}
      onClose={() => onOpenChange(false)}
      title="Keyboard Shortcuts"
      description="Speed up your workflow with these keyboard shortcuts"
      size="md"
    >
      <div className="space-y-6">
        {shortcuts.map((section) => (
          <div key={section.category} className="space-y-3">
            <h3 className="aurora-label text-sm font-semibold text-slate-900 dark:text-slate-50 uppercase tracking-wide">
              {section.category}
            </h3>
            <div className="space-y-2">
              {section.items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="aurora-label text-sm text-slate-700 dark:text-slate-300">
                    {item.description}
                  </span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {item.keys.map((key, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <kbd
                          className={clsx(
                            'px-2 py-1 text-xs font-semibold',
                            'bg-slate-100 dark:bg-slate-800',
                            'border border-slate-300 dark:border-slate-700',
                            'rounded shadow-sm',
                            'aurora-label text-slate-900 dark:text-slate-100'
                          )}
                        >
                          {key}
                        </kbd>
                        {i < item.keys.length - 1 && (
                          <span className="aurora-label text-slate-400">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
          <p className="aurora-label text-xs text-blue-900 dark:text-blue-100">
            <strong>Tip:</strong> Most shortcuts work globally, but some navigation shortcuts won&apos;t work when you&apos;re typing in an input field.
          </p>
        </div>
      </div>
    </AuroraModal>
  );
}
