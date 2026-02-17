'use client';

import { Card, CardTitle } from '@/components/aurora/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/aurora/Badge';
import { StatCard } from '@/components/aurora/StatCard';
import { AuroraDataService } from '@/data/types';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';

const routes = AuroraDataService.getRoutes();
const places = AuroraDataService.getSavedPlaces();

export function NavigationUniverse() {
  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Navigation Universe"
        description="Explore routes, book rides, and navigate your world in one place."
      />

      <SurfaceSection title="Navigation Snapshot">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Saved Places" value={places.length} helper="Favorites" />
          <StatCard label="Active Routes" value={routes.length} helper="In plan" />
          <StatCard label="Ride Integrations" value={3} helper="Connected" />
        </div>
      </SurfaceSection>

      <SurfaceSection title="Live Insight">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="aurora-label text-slate-500 dark:text-slate-400">Live Insight</p>
              <p className="aurora-label text-lg font-semibold text-slate-900 dark:text-slate-50">
                Typical commute: 24 min • Traffic light today
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">Book Ride</Button>
              <Button variant="ghost" size="sm">Share ETA</Button>
            </div>
          </div>
        </Card>
      </SurfaceSection>

      <SurfaceSection title="Routes & Places">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-8">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>Route Planner</CardTitle>
              <Button variant="secondary" size="sm">New Route</Button>
            </div>
            <div className="h-64 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
              <p className="aurora-label text-sm text-slate-500 dark:text-slate-400">Map Preview</p>
            </div>
            <div className="space-y-3" role="list" aria-label="Routes">
              {routes.map((route) => (
                <div key={route.id} role="listitem" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="aurora-label text-slate-900 dark:text-slate-50">
                      {route.from} → {route.to}
                    </p>
                    <Badge size="sm" variant="info">{route.mode}</Badge>
                  </div>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                    {route.durationMinutes} min • {route.distanceMiles.toFixed(1)} mi
                  </p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3" role="list" aria-label="Route modes">
              {['Drive', 'Transit', 'Walk', 'Ride'].map((mode) => (
                <Button key={mode} variant="ghost" size="sm" role="listitem">
                  {mode} mode
                </Button>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="space-y-4">
              <CardTitle>Saved Places</CardTitle>
              <div className="space-y-3" role="list" aria-label="Saved places">
                {places.map((place) => (
                  <div key={place.id} role="listitem" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="aurora-label text-slate-900 dark:text-slate-50">{place.name}</p>
                      <Badge size="sm" variant="default">{place.category}</Badge>
                    </div>
                    <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">{place.address}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-4">
              <CardTitle>Ride Options</CardTitle>
              <div className="space-y-3" role="list" aria-label="Ride options">
                {['Uber', 'Lyft', 'Waze'].map((provider) => (
                  <div key={provider} role="listitem" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                    <p className="aurora-label text-slate-900 dark:text-slate-50">{provider}</p>
                    <Button variant="ghost" size="sm">Connect</Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </SurfaceSection>
    </Surface>
  );
}
