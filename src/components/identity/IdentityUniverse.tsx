'use client';

import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';
import { Badge } from '@/components/aurora/Badge';
import { StatCard } from '@/components/aurora/StatCard';
import { AuroraDataService } from '@/data/types';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';

const profile = AuroraDataService.getIdentityProfile();
const personas = AuroraDataService.getPersonas();
const lifeGraph = AuroraDataService.getLifeGraph();
const digitalTwin = AuroraDataService.getDigitalTwinSuggestions();

export function IdentityUniverse() {
  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Identity Universe"
        description="You are a planet, not a profile. Aurora adapts to your identity, intent, and rhythm."
      />

      <SurfaceSection title="Identity Snapshot">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Active Personas" value={personas.length} />
          <StatCard label="Life Graph Nodes" value={lifeGraph.length} />
          <StatCard label="Twin Insights" value={digitalTwin.length} />
        </div>
      </SurfaceSection>

      <SurfaceSection title="Personas & Models">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
          <div className="space-y-6">
            <Card className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                Personas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {personas.map((persona) => (
                  <div key={persona.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">
                      {persona.name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Mode: {persona.mode}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(persona.preferences).map(([key, value]) => (
                        <Badge key={key} size="sm">
                          {key}: {String(value)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="secondary">Manage Personas</Button>
            </Card>

            <Card className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                Life Graph
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                A living model of your interests, skills, habits, and rhythms.
              </p>
              <div className="flex flex-wrap gap-2">
                {lifeGraph.map((node) => (
                  <span
                    key={node.id}
                    className="px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-medium"
                  >
                    {node.label}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                Digital Twin
              </h2>
              <div className="space-y-3">
                {digitalTwin.map((suggestion) => (
                  <div key={suggestion.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {suggestion.title}
                      </p>
                      <Badge variant="info" size="sm">
                        {Math.round(suggestion.confidence * 100)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {suggestion.description}
                    </p>
                    <Button variant="primary" size="sm">
                      {suggestion.actionLabel}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Public Identity</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {profile.publicBio}
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.values.map((value) => (
                  <Badge key={value} size="sm">
                    {value}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Private Context</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {profile.privateBio}
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.focusThemes.map((theme) => (
                  <Badge key={theme} variant="primary" size="sm">
                    {theme}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Privacy Mode</h3>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-400">Current</p>
                <Badge variant="success" size="sm">
                  {profile.privacyMode}
                </Badge>
              </div>
              <Button variant="secondary" size="sm">
                Adjust Privacy
              </Button>
            </Card>
          </div>
        </div>
      </SurfaceSection>
    </Surface>
  );
}
