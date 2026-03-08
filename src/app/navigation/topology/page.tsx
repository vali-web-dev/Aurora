import Link from 'next/link';
import { AuroraShell } from '@/components/os/AuroraShell';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { Card, CardDescription, CardTitle } from '@/components/aurora/Card';
import { Button } from '@/components/ui/Button';
import { expandableNavigation } from '@/lib/expandable-navigation';
import { EditorRuntimeDiagnosticsPanel } from '@/components/navigation/EditorRuntimeDiagnosticsPanel';
import { SchedulerProfilesPanel, type SchedulerProfileItem } from '@/components/navigation/SchedulerProfilesPanel';
import { PageIcon, getPageIconColor, resolvePageIconName } from '@/components/aurora/PageIcons';

const spotlightTools = [
  { href: '/create/editor', label: 'Aurora Editor', description: 'Main visual editor workspace' },
  { href: '/brand/photoshop-pro', label: 'Photoshop Pro', description: 'Pro-grade image editing' },
  { href: '/brand/photoshop-canvas', label: 'Photoshop Canvas', description: 'Canvas-first PS-like editor' },
  { href: '/brand/photoshop-canvas-advanced', label: 'Photoshop Canvas Advanced', description: 'Advanced layer and mask workflow' },
  { href: '/brand/photoshop-enhanced', label: 'Photoshop Enhanced', description: 'Enhanced editing interface' },
  { href: '/brand/aurora-logo-studio', label: 'Aurora Logo Studio', description: 'Integrated brand design studio' },
  { href: '/health/human-model', label: 'Human Model', description: 'Dedicated 3D anatomy explorer' },
];

const grouped = {
  Primary: expandableNavigation.filter((item) => item.group === 'Primary'),
  Explore: expandableNavigation.filter((item) => item.group === 'Explore'),
  Support: expandableNavigation.filter((item) => item.group === 'Support'),
};

const schedulerProfiles: SchedulerProfileItem[] = [
  {
    profile: 'dev',
    command: 'npm run diagnostics:schedule:once:dev',
    jobs: ['editor-runtime-snapshot'],
    description: 'Local-safe runtime telemetry snapshot only.',
  },
  {
    profile: 'runtime',
    command: 'npm run diagnostics:schedule:once:runtime',
    jobs: ['editor-runtime-snapshot', 'editor-runtime-gate-strict'],
    description: 'Runtime-focused validation with strict gate.',
  },
  {
    profile: 'ci',
    command: 'npm run diagnostics:schedule:once:ci',
    jobs: ['api-diagnostics', 'platform-diagnostics', 'editor-runtime-snapshot', 'editor-runtime-gate-strict'],
    description: 'Full CI diagnostics profile across platform + runtime.',
  },
  {
    profile: 'full',
    command: 'npm run diagnostics:schedule -- --profile full',
    jobs: ['api-diagnostics', 'platform-diagnostics', 'editor-runtime-snapshot', 'editor-runtime-gate-strict'],
    description: 'Continuous scheduler mode for all production diagnostics jobs.',
  },
];

export default function TopologyPage() {
  return (
    <AuroraShell>
      <Surface className="py-8">
        <SurfaceHeader
          title="Feature Topology"
          description="Complete clickable directory of Aurora universes, tools, and feature routes."
        />

        <SurfaceSection title="Editor & Model Tools" description="Direct launch links for creative and human-model surfaces.">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" role="list" aria-label="Spotlight tools">
            {spotlightTools.map((tool) => {
              const iconName = resolvePageIconName(tool.label, tool.href);
              return (
                <Card key={tool.href} role="listitem" className="space-y-3">
                  <div>
                    <CardTitle>
                      <span className="inline-flex items-center gap-2">
                        <span className={getPageIconColor(iconName)} aria-hidden="true">
                          <PageIcon pageName={iconName} className="h-4 w-4" />
                        </span>
                        <span>{tool.label}</span>
                      </span>
                    </CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </div>
                  <Link href={tool.href}>
                    <Button variant="primary" size="sm" className="w-full">Open</Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        </SurfaceSection>

        <SurfaceSection title="Runtime Reliability" description="Live diagnostics for editor operations, retries, and circuit-breaker health.">
          <EditorRuntimeDiagnosticsPanel />
        </SurfaceSection>

        <SurfaceSection title="Scheduler Profiles" description="Operational profile mapping for diagnostics scheduler jobs.">
          <SchedulerProfilesPanel profiles={schedulerProfiles} />
        </SurfaceSection>

        <SurfaceSection title="All Universes & Routes" description="Every configured route appears below with clickable parent and child links.">
          <div className="space-y-6">
            {Object.entries(grouped).map(([groupName, items]) => (
              <Card key={groupName} className="space-y-4">
                <CardTitle>{groupName}</CardTitle>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" role="list" aria-label={`${groupName} navigation`}>
                  {items.map((item) => {
                    const itemIconName = resolvePageIconName(item.label, item.href);
                    return (
                    <div key={item.href} role="listitem" className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="aurora-label text-sm text-slate-500 dark:text-slate-400">Universe</p>
                          <p className="aurora-label inline-flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-50">
                            <span className={getPageIconColor(itemIconName)} aria-hidden="true">
                              <PageIcon pageName={itemIconName} className="h-4 w-4" />
                            </span>
                            <span>{item.label}</span>
                          </p>
                        </div>
                        <Link href={item.href}>
                          <Button variant="secondary" size="sm">Open</Button>
                        </Link>
                      </div>

                      {item.children && item.children.length > 0 && (
                        <div className="space-y-2" role="list" aria-label={`${item.label} routes`}>
                          {item.children.map((child) => {
                            const childIconName = resolvePageIconName(child.label, child.href);
                            return (
                            <div key={`${item.href}-${child.href}`} role="listitem" className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 dark:bg-slate-900 px-3 py-2">
                              <div>
                                <p className="aurora-label inline-flex items-center gap-2 text-sm text-slate-900 dark:text-slate-50">
                                  <span className={getPageIconColor(childIconName)} aria-hidden="true">
                                    <PageIcon pageName={childIconName} className="h-3.5 w-3.5" />
                                  </span>
                                  <span>{child.label}</span>
                                </p>
                                {child.description && (
                                  <p className="aurora-label text-xs text-slate-500 dark:text-slate-400">{child.description}</p>
                                )}
                              </div>
                              <Link href={child.href}>
                                <Button variant="ghost" size="sm">Go</Button>
                              </Link>
                            </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </SurfaceSection>
      </Surface>
    </AuroraShell>
  );
}
