import Link from 'next/link';

type PlaceholderPageProps = {
  baseTitle: string;
  baseHref: string;
  slug: string[];
};

const formatSegment = (segment: string) =>
  segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export function PlaceholderPage({ baseTitle, baseHref, slug }: PlaceholderPageProps) {
  const subtitle = slug.length > 0 ? slug.map(formatSegment).join(' / ') : 'Overview';
  const title = slug.length > 0 ? `${baseTitle} / ${subtitle}` : baseTitle;
  const segments = slug.map((segment, index) => {
    const href = `${baseHref}/${slug.slice(0, index + 1).join('/')}`;
    return { href, label: formatSegment(segment) };
  });

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 py-16">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-8 shadow-sm">
        <nav aria-label="Breadcrumb" className="aurora-label text-xs text-slate-500 dark:text-slate-400">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="aurora-label hover:text-slate-700 dark:hover:text-slate-200">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={baseHref} className="aurora-label hover:text-slate-700 dark:hover:text-slate-200">
                {baseTitle}
              </Link>
            </li>
            {segments.map((segment) => (
              <li key={segment.href} className="flex items-center gap-2">
                <span aria-hidden="true">/</span>
                <Link href={segment.href} className="aurora-label hover:text-slate-700 dark:hover:text-slate-200">
                  {segment.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <p className="aurora-label tracking-[0.3em] text-slate-500 dark:text-slate-400">
          Aurora
        </p>
        <h1 className="aurora-label mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-50">
          {title}
        </h1>
        <p className="aurora-label mt-3 text-sm text-slate-600 dark:text-slate-400">
          This section is being prepared. Check back soon for updates.
        </p>
        <div className="mt-6">
          <Link
            href={baseHref}
            className="aurora-label inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
          >
            Back to {baseTitle}
          </Link>
        </div>
      </div>
    </main>
  );
}
