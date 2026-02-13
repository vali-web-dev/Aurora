'use client';

import { ReactNode } from 'react';
import { TopNav } from './Topnav';
import { Footer } from './Footer';

export function AuroraShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col">
      <TopNav />
      <main 
        id="main-content" 
        className="mx-auto max-w-7xl px-4 py-12 flex-grow"
        role="main"
        aria-label="Main content"
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}