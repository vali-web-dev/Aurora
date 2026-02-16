import Link from 'next/link';
import { Button } from '@/components/aurora/Button';

export function Hero() {
  return (
    <section className="grid gap-12 md:grid-cols-[1.4fr,1fr] items-center py-12">
      <div className="space-y-8">
        <div className="space-y-4">
          <p className="aurora-label text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
            Aurora — Digital Civilization
          </p>
          <h1 className="aurora-display">
            A calm, beautifully designed digital world for your creative life.
          </h1>
          <p className="aurora-label text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
            Aurora brings clarity, inspiration, and emotional resonance to everything you create. 
            One place for your ideas, projects, and creativity.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link href="/product">
            <Button size="lg" variant="primary">
              Explore Aurora
            </Button>
          </Link>
          <Link href="/realms">
            <Button size="lg" variant="secondary">
              See the Vision
            </Button>
          </Link>
        </div>

        <div className="aurora-label flex gap-6 pt-4 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <p className="aurora-label text-slate-900 dark:text-slate-50">15 Universes</p>
            <p>Everything you need, unified</p>
          </div>
          <div>
            <p className="aurora-label text-slate-900 dark:text-slate-50">Ethical AI</p>
            <p>Privacy-first, transparent</p>
          </div>
          <div>
            <p className="aurora-label text-slate-900 dark:text-slate-50">Adaptive</p>
            <p>Responsive across all devices</p>
          </div>
        </div>
      </div>

      {/* Visual showcase */}
      <div className="relative h-64 sm:h-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-950 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,_#60a5fa33,_transparent_50%),radial-gradient(circle_at_bottom_left,_#a855f733,_transparent_50%)]" />
        
        <div className="relative flex h-full flex-col justify-between p-6">
          <div className="space-y-2">
            <p className="aurora-label text-slate-500 dark:text-slate-400">
              Aurora OS Sample
            </p>
            <p className="aurora-label text-sm text-slate-700 dark:text-slate-300">
              15 interconnected universes in one cohesive interface.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white/50 dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-700">
              <p className="aurora-label text-xs text-slate-900 dark:text-slate-50 mb-1">
                Design System
              </p>
              <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                Tokens, themes, motion
              </p>
            </div>
            <div className="rounded-lg bg-white/50 dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-700">
              <p className="aurora-label text-xs text-slate-900 dark:text-slate-50 mb-1">
                Accessibility
              </p>
              <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                WCAG 2.1 AA+
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
