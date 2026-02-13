'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { mainNav } from '@/lib/navigation';
import { useMemory } from '@/lib/memory/memory-provider';

const navLabelMap = new Map(mainNav.map((item) => [item.href, item.label]));

const formatUniverseLabel = (pathname: string) => {
  if (pathname === '/') return 'Home';
  const segment = pathname.split('/').filter(Boolean)[0] ?? 'Home';
  return segment
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export function MemoryTracker() {
  const pathname = usePathname();
  const { setLocation } = useMemory();

  useEffect(() => {
    if (!pathname) return;
    const label = navLabelMap.get(pathname) ?? formatUniverseLabel(pathname);
    setLocation({ route: pathname, universe: label });
  }, [pathname, setLocation]);

  return null;
}
