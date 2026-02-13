'use client';

import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';
import { Badge } from '@/components/aurora/Badge';
import { StatCard } from '@/components/aurora/StatCard';
import { AuroraDataService, type Task, type TaskStatus } from '@/data/types';

const tasks = AuroraDataService.getTasks();
const notes = AuroraDataService.getNotes();
const events = AuroraDataService.getCalendarEvents();

const statusLabels: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
};

const priorityVariant: Record<Task['priority'], 'default' | 'warning' | 'error'> = {
  low: 'default',
  medium: 'warning',
  high: 'error',
};

export function ProductivityUniverse() {
  const tasksByStatus = tasks.reduce<Record<TaskStatus, Task[]>>(
    (acc, task) => {
      acc[task.status].push(task);
      return acc;
    },
    {
      backlog: [],
      'in-progress': [],
      review: [],
      done: [],
    }
  );

  const upcoming = events.slice(0, 3);
  const doneCount = tasksByStatus.done.length;
  const inProgressCount = tasksByStatus['in-progress'].length;

  return (
    <div className="space-y-8 py-8">
      <div className="space-y-3">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-50">
          Productivity Universe
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl">
          Work with clarity. Create with flow. Everything you need for focused execution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="In Progress" value={inProgressCount} helper="Active tasks" />
        <StatCard label="Completed" value={doneCount} helper="This week" />
        <StatCard label="Upcoming Events" value={upcoming.length} helper="Next 3 items" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
        {/* Kanban */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Task Board
            </h2>
            <Button variant="secondary">New Task</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(tasksByStatus).map(([status, items]) => (
              <Card key={status} className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {statusLabels[status as TaskStatus]}
                  </p>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {items.map((task) => (
                    <div key={task.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge variant={priorityVariant[task.priority]} size="sm">
                          {task.priority}
                        </Badge>
                        {task.dueDate && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {task.dueDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Side panels */}
        <div className="space-y-6">
          <Card className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Notes</h3>
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="font-semibold text-slate-900 dark:text-slate-50">
                    {note.title}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {note.body}
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {note.tags.map((tag) => (
                      <Badge key={tag} size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Upcoming</h3>
            <div className="space-y-3">
              {upcoming.map((event) => (
                <div key={event.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="font-semibold text-slate-900 dark:text-slate-50">
                    {event.title}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {event.startsAt.toLocaleString()} • {event.durationMinutes} min
                  </p>
                  {event.location && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {event.location}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
