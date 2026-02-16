import { Card } from '@/components/aurora/Card';

export function TrustSection() {
  return (
    <section className="space-y-8 border-t border-slate-200 dark:border-slate-800 pt-12 py-12">
      <div className="space-y-3">
        <h2 className="aurora-label text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
          Trust & Principles
        </h2>
        <p className="aurora-label text-2xl font-bold text-slate-900 dark:text-slate-50">
          Built on integrity and clarity.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="space-y-2">
            <p className="aurora-label text-lg font-semibold text-slate-900 dark:text-slate-50">
              🔐 Ethical AI
            </p>
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
              Non-invasive, optional, transparent. AI supports creativity, never manipulates.
            </p>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <p className="aurora-label text-lg font-semibold text-slate-900 dark:text-slate-50">
              🛡️ Privacy-First
            </p>
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
              Your data belongs to you. No selling, trading, or exploiting.
            </p>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <p className="aurora-label text-lg font-semibold text-slate-900 dark:text-slate-50">
              ♿ Accessible
            </p>
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
              High contrast, large text, screen readers, clear language.
            </p>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <p className="aurora-label text-lg font-semibold text-slate-900 dark:text-slate-50">
              💫 No Dark Patterns
            </p>
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
              Transparent pricing, clear settings, respectful design.
            </p>
          </div>
        </Card>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
        <p className="aurora-label text-sm text-slate-600 dark:text-slate-300">
          Aurora is built with clarity, not hype. We&apos;re transparent about what&apos;s ready and what&apos;s coming.
          {' '}
          <span className="aurora-label text-slate-900 dark:text-slate-50">
            Your trust is everything to us.
          </span>
        </p>
      </div>
    </section>
  );
}
