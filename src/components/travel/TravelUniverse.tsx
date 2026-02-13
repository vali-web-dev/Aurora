'use client';

import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';
import { Badge } from '@/components/aurora/Badge';
import { StatCard } from '@/components/aurora/StatCard';
import { AuroraDataService } from '@/data/types';

const trips = AuroraDataService.getTrips();
const itinerary = AuroraDataService.getItinerary();
const packingList = AuroraDataService.getPackingList();
const budgetCategories = AuroraDataService.getBudgetCategories();

const upcomingTrips = trips.filter((trip) => trip.status === 'upcoming');

export function TravelUniverse() {
  const activeTrip = trips[1] ?? trips[0];
  const tripPacking = packingList.filter((item) => item.tripId === activeTrip?.id);
  const tripBudget = budgetCategories.filter((item) => item.tripId === activeTrip?.id);
  const budgetTotal = tripBudget.reduce((sum, item) => sum + item.budgetCents, 0);
  const budgetSpent = tripBudget.reduce((sum, item) => sum + item.spentCents, 0);

  return (
    <div className="space-y-8 py-8">
      <div className="space-y-3">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-50">Travel Universe</h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl">
          Plan journeys, organize itineraries, and travel with clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Upcoming Trips" value={upcomingTrips.length} />
        <StatCard label="Itinerary Items" value={itinerary.length} />
        <StatCard label="Saved Budgets" value={`$${(trips.reduce((sum, t) => sum + t.budgetCents, 0) / 100).toFixed(0)}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-8">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Trips</h2>
            <Button variant="secondary" size="sm">New Trip</Button>
          </div>
          <div className="space-y-3">
            {upcomingTrips.map((trip) => (
              <div key={trip.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{trip.destination}</p>
                  <Badge size="sm" variant="info">{trip.status}</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {trip.startDate.toLocaleDateString()} - {trip.endDate.toLocaleDateString()}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Budget ${(trip.budgetCents / 100).toFixed(0)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Today\'s Itinerary</h2>
          <div className="space-y-3">
            {itinerary.map((item) => (
              <div key={item.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{item.title}</p>
                  <Badge size="sm" variant="default">{item.type}</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {item.time} • {item.location}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Travel Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Itinerary Builder', 'Packing List', 'Budget Planner'].map((tool) => (
            <div key={tool} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
              <p className="font-semibold text-slate-900 dark:text-slate-50">{tool}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Ready to customize</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Packing List</h2>
            <Button variant="ghost" size="sm">Manage</Button>
          </div>
          <div className="space-y-3">
            {tripPacking.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{item.label}</p>
                <Badge size="sm" variant={item.packed ? 'success' : 'default'}>
                  {item.packed ? 'Packed' : 'To pack'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Budget Breakdown</h2>
            <Badge size="sm" variant="info">
              ${(budgetSpent / 100).toFixed(0)} / ${(budgetTotal / 100).toFixed(0)}
            </Badge>
          </div>
          <div className="space-y-3">
            {tripBudget.map((item) => {
              const pct = Math.round((item.spentCents / item.budgetCents) * 100);
              return (
                <div key={item.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{item.label}</p>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      ${(item.spentCents / 100).toFixed(0)} / ${(item.budgetCents / 100).toFixed(0)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
