'use client';

import { Card, CardTitle } from '@/components/aurora/Card';
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
          <StatCard label="Active Personas" value={personas.length} helper="In rotation" />
          <StatCard label="Life Graph Nodes" value={lifeGraph.length} helper="Tracked" />
          <StatCard label="Twin Insights" value={digitalTwin.length} helper="Suggestions" />
        </div>
      </SurfaceSection>

      <SurfaceSection title="Personas & Models">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
          <div className="space-y-6">
            <Card className="space-y-4">
              <CardTitle>Personas</CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="list" aria-label="Personas">
                {personas.map((persona) => (
                  <div key={persona.id} role="listitem" className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">
                      {persona.name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Mode: {persona.mode}
                    </p>
                    <div className="flex flex-wrap gap-2" role="list" aria-label="Persona preferences">
                      {Object.entries(persona.preferences).map(([key, value]) => (
                        <span key={key} role="listitem">
                          <Badge size="sm">
                            {key}: {String(value)}
                          </Badge>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="secondary">Manage Personas</Button>
            </Card>

            <Card className="space-y-4">
              <CardTitle>Life Graph</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                A living model of your interests, skills, habits, and rhythms.
              </p>
              <div className="flex flex-wrap gap-2" role="list" aria-label="Life graph nodes">
                {lifeGraph.map((node) => (
                  <Badge
                    key={node.id}
                    role="listitem"
                    variant="default"
                    size="md"
                  >
                    {node.label}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card className="space-y-4">
              <CardTitle>Digital Twin</CardTitle>
              <div className="space-y-3" role="list" aria-label="Digital twin suggestions">
                {digitalTwin.map((suggestion) => (
                  <div key={suggestion.id} role="listitem" className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
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
              <CardTitle>Public Identity</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {profile.publicBio}
              </p>
              <div className="flex flex-wrap gap-2" role="list" aria-label="Public values">
                {profile.values.map((value) => (
                  <span key={value} role="listitem">
                    <Badge size="sm">{value}</Badge>
                  </span>
                ))}
              </div>
            </Card>

            <Card className="space-y-3">
              <CardTitle>Private Context</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {profile.privateBio}
              </p>
              <div className="flex flex-wrap gap-2" role="list" aria-label="Focus themes">
                {profile.focusThemes.map((theme) => (
                  <span key={theme} role="listitem">
                    <Badge variant="primary" size="sm">{theme}</Badge>
                  </span>
                ))}
              </div>
            </Card>

            <Card className="space-y-3">
              <CardTitle>Privacy Mode</CardTitle>
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
