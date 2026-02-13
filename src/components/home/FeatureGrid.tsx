import { Card } from '@/components/aurora/Card';

const features = [
  {
    title: 'Forge',
    icon: '🔨',
    body: 'Build components, surfaces, and creative studio for your ideas.',
  },
  {
    title: 'Realms',
    icon: '🌍',
    body: 'Explore interactive environments designed for focus and creativity.',
  },
  {
    title: 'Guilds',
    icon: '👥',
    body: 'Join creator groups and collaborate on meaningful work.',
  },
  {
    title: 'Themes',
    icon: '✨',
    body: 'Adapt interfaces to your mood with light, dark, and illuminated modes.',
  },
  {
    title: 'Companion',
    icon: '🤝',
    body: 'A calm, supportive guide that understands your needs.',
  },
  {
    title: 'Lightforge',
    icon: '💡',
    body: 'Our rendering system built for beauty and clarity.',
  },
];

export function FeatureGrid() {
  return (
    <section className="space-y-8 py-12">
      <div className="space-y-3">
        <h2 className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
          Core Features
        </h2>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Everything you need, beautifully unified.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} hoverable className="flex flex-col gap-3">
            <div className="text-3xl">{feature.icon}</div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {feature.body}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}