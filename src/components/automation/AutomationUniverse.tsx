'use client';

import { Card, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/aurora/StatCard';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { AuroraDataService } from '@/data/types';
import { formatDateTime } from '@/lib/utils';

const workflows = AuroraDataService.getWorkflows();
const triggers = AuroraDataService.getWorkflowTriggers();
const actions = AuroraDataService.getWorkflowActions();
const bots = AuroraDataService.getBotInstances();

const activeWorkflows = workflows.filter((w) => w.status === 'active').length;
const totalExecutions = workflows.reduce((sum, w) => sum + w.executionCount, 0);
const avgSuccessRate = (workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length * 100).toFixed(0);

export function AutomationUniverse() {
  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Automation & Agents Universe"
        description="Orchestrate workflows, triggers, actions, and autonomous bot agents at scale."
      />

      <SurfaceSection title="Automation Snapshot">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Active Workflows" value={activeWorkflows} helper="Running" />
          <StatCard label="Total Executions" value={totalExecutions} helper="Lifetime" />
          <StatCard label="Avg Success Rate" value={`${avgSuccessRate}%`} helper="All workflows" />
        </div>
      </SurfaceSection>

      <SurfaceSection title="Workflow Overview" description="Realtime visibility across orchestration.">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="aurora-label text-slate-500 dark:text-slate-400">
                Automation Platform
              </p>
              <CardTitle>Workflow Overview</CardTitle>
            </div>
            <Badge size="sm" variant="info">Real-time</Badge>
          </div>
          <div className="space-y-3" role="list" aria-label="Workflows">
            {workflows.map((workflow) => (
              <div key={workflow.id} role="listitem" className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="aurora-label text-slate-900 dark:text-slate-50">{workflow.name}</p>
                  <Badge
                    size="sm"
                    variant={
                      workflow.status === 'active'
                        ? 'success'
                        : workflow.status === 'paused'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {workflow.status}
                  </Badge>
                </div>
                <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">{workflow.description}</p>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="aurora-label text-slate-600 dark:text-slate-400">Executions</p>
                    <p className="aurora-label text-slate-900 dark:text-slate-50">{workflow.executionCount}</p>
                  </div>
                  <div>
                    <p className="aurora-label text-slate-600 dark:text-slate-400">Success Rate</p>
                    <p className="aurora-label text-slate-900 dark:text-slate-50">{(workflow.successRate * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="aurora-label text-slate-600 dark:text-slate-400">Next Run</p>
                    <p className="aurora-label text-slate-900 dark:text-slate-50">
                      {workflow.nextRun ? formatDateTime(workflow.nextRun) : 'Manual'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </SurfaceSection>

      <SurfaceSection title="Triggers, Bots, Actions">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-8">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>Triggers</CardTitle>
              <Button variant="secondary" size="sm">New Trigger</Button>
            </div>
            <div className="space-y-3" role="list" aria-label="Triggers">
              {triggers.map((trigger) => (
                <div key={trigger.id} role="listitem" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="aurora-label text-slate-900 dark:text-slate-50">
                      {workflows.find((w) => w.id === trigger.workflowId)?.name ?? 'Unknown'}
                    </p>
                    <Badge size="sm" variant="default">{trigger.type}</Badge>
                  </div>
                  <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">{trigger.condition}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle>Bot Agents</CardTitle>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              <div className="space-y-3" role="list" aria-label="Bot agents">
                {bots.map((bot) => (
                  <div key={bot.id} role="listitem" className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="aurora-label text-slate-900 dark:text-slate-50">{bot.name}</p>
                      <Badge size="sm" variant="success">
                        {(bot.uptime * 100).toFixed(2)}%
                      </Badge>
                    </div>
                    <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                      {bot.capability} • {bot.tasksCompleted} tasks • Last: {formatDateTime(bot.lastExecuted)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-3">
              <CardTitle>System Health</CardTitle>
              <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
                All automation systems operating nominally with {bots.length} active agents.
              </p>
              <Button variant="primary" size="sm">View Dashboard</Button>
            </Card>
          </div>
        </div>
      </SurfaceSection>

      <SurfaceSection title="Actions">
        <Card className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Actions">
            {actions.map((action) => (
              <div key={action.id} role="listitem" className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="aurora-label text-slate-900 dark:text-slate-50">
                    Step {action.order}
                  </p>
                  <Badge size="sm" variant="default">{action.type}</Badge>
                </div>
                <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                  {workflows.find((w) => w.id === action.workflowId)?.name ?? 'Unknown Workflow'}
                </p>
                <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                  Config: {Object.keys(action.config).join(', ')}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </SurfaceSection>
    </Surface>
  );
}
