'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCompanion } from '@/lib/companion/companion-provider';

/**
 * useKeyboardShortcuts
 * 
 * Global keyboard shortcuts for Aurora
 * 
 * Shortcuts:
 * - Ctrl/Cmd + K: Open search
 * - Ctrl/Cmd + /: Open docs portal
 * - Ctrl/Cmd + B: Toggle companion panel
 * - Ctrl/Cmd + H: Navigate to home
 * - Ctrl/Cmd + Shift + L: Navigate to learning
 * - Ctrl/Cmd + Shift + F: Navigate to forge
 * - Ctrl/Cmd + Shift + P: Navigate to productivity
 * - ?: Show keyboard shortcuts help (when not in input)
 * 
 * @see AURORA_MANUAL.md § Keyboard Shortcuts
 */
export function useKeyboardShortcuts(
  onOpenSearch?: () => void,
  onOpenDocs?: () => void,
  onOpenHelp?: () => void
) {
  const router = useRouter();
  const { toggle: toggleCompanion } = useCompanion();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || 
                      target.tagName === 'TEXTAREA' || 
                      target.isContentEditable;

      // Cmd/Ctrl + K: Search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onOpenSearch?.();
        return;
      }

      // Cmd/Ctrl + /: Docs
      if ((event.metaKey || event.ctrlKey) && event.key === '/') {
        event.preventDefault();
        onOpenDocs?.();
        return;
      }

      // Cmd/Ctrl + B: Companion Panel
      if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
        event.preventDefault();
        toggleCompanion();
        return;
      }

      // Navigation shortcuts (only when not in input)
      if (isInput) return;

      // Cmd/Ctrl + H: Home
      if ((event.metaKey || event.ctrlKey) && event.key === 'h') {
        event.preventDefault();
        router.push('/');
        return;
      }

      // Cmd/Ctrl + Shift + L: Learning
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'L') {
        event.preventDefault();
        router.push('/learning');
        return;
      }

      // Cmd/Ctrl + Shift + F: Forge
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'F') {
        event.preventDefault();
        router.push('/forge');
        return;
      }

      // Cmd/Ctrl + Shift + P: Productivity
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        router.push('/productivity');
        return;
      }

      // ?: Show help (only when not in input)
      if (event.key === '?' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        onOpenHelp?.();
        return;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router, toggleCompanion, onOpenSearch, onOpenDocs, onOpenHelp]);
}
