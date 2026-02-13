import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import Link from 'next/link';

interface ProductOverviewProps {
  title?: string;
  description?: string;
  features?: string[];
}

export function ProductOverview({
  title = 'Coming Soon',
  description = 'This universe is under construction. Check back soon!',
  features = [],
}: ProductOverviewProps) {
  return (
    <Surface className="py-12">
      <SurfaceHeader
        title={title}
        description={description}
        actions={
          <Link href="/">
            <Button variant="primary">Back to Home</Button>
          </Link>
        }
      />

      {features.length > 0 && (
        <SurfaceSection title="Highlights">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Card key={i}>
                <p className="text-slate-900 dark:text-slate-50">{feature}</p>
              </Card>
            ))}
          </div>
        </SurfaceSection>
      )}

      <SurfaceSection title="Aurora is in development">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-900 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-3">
            🚀 Aurora is in development
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            All 15 universes are being built with the same care, clarity, and ethical principles.
          </p>
          <Link href="/roadmap">
            <Button variant="secondary">See the Roadmap</Button>
          </Link>
        </div>
      </SurfaceSection>
    </Surface>
  );
}
