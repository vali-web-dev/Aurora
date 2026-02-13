'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

interface SkipLink {
  href: string;
  label: string;
}

const skipLinks: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#navigation', label: 'Skip to navigation' },
  { href: '#footer', label: 'Skip to footer' },
];

export function SkipLinks() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsVisible(true);
      }
    };

    const handleBlur = () => {
      setTimeout(() => {
        if (!document.activeElement?.closest('.skip-links')) {
          setIsVisible(false);
        }
      }, 100);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  return (
    <nav
      className={clsx(
        'skip-links fixed top-0 left-0 z-[100] flex gap-2 p-2',
        'focus-within:opacity-100',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      aria-label="Skip navigation links"
    >
      {skipLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={clsx(
            'px-4 py-2 rounded-lg',
            'bg-blue-600 text-white font-medium text-sm',
            'focus:outline-none focus:ring-4 focus:ring-blue-400',
            'transform transition-all duration-200',
            'hover:bg-blue-700 hover:shadow-lg',
            'focus:scale-105'
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
