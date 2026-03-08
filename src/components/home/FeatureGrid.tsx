import { Card, CardDescription, CardTitle } from '@/components/aurora/Card';
import Link from 'next/link';
import { PageIcon, getPageIconColor, resolvePageIconName } from '@/components/aurora/PageIcons';

const features = [
  {
    title: 'Create',
    body: 'Build components, surfaces, and creative studio for your ideas.',
    href: '/create',
  },
  {
    title: 'Realms',
    body: 'Explore interactive environments designed for focus and creativity.',
    href: '/realms',
  },
  {
    title: 'Guilds',
    body: 'Join creator groups and collaborate on meaningful work.',
    href: '/guilds',
  },
  {
    title: 'Themes',
    body: 'Adapt interfaces to your mood with light, dark, and illuminated modes.',
    href: '/settings',
  },
  {
    title: 'Companion',
    body: 'A calm, supportive guide that understands your needs.',
    href: '/ai',
  },
  {
    title: 'Lightfoundry',
    body: 'Our rendering system built for beauty and clarity.',
    href: '/brand',
  },
];

export function FeatureGrid() {
  return (
    <section className="space-y-8 py-12">
      <div className="space-y-3">
        <h2 className="aurora-label text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
          Core Features
        </h2>
        <p className="aurora-label text-2xl font-bold text-slate-900 dark:text-slate-50">
          Everything you need, beautifully unified.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {features.map((feature) => {
          const iconName = resolvePageIconName(feature.title, feature.href);
          return (
          <Link key={feature.title} href={feature.href} className="block">
            <Card hoverable className="flex flex-col gap-3">
              <div className={getPageIconColor(iconName)}>
                <PageIcon pageName={iconName} className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.body}</CardDescription>
              </div>
            </Card>
          </Link>
          );
        })}
      </div>
    </section>
  );
}