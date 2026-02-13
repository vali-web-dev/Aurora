'use client';

import { Card } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/aurora/Button';
import { StatCard } from '@/components/aurora/StatCard';
import { AuroraDataService } from '@/data/types';

const workflows = AuroraDataService.getWorkflows();
const triggers = AuroraDataService.getWorkflowTriggers();
const actions = AuroraDataService.getWorkflowActions();
const bots = AuroraDataService.getBotInstances();

const activeWorkflows = workflows.filter((w) => w.status === 'active').length;
const totalExecutions = workflows.reduce((sum, w) => sum + w.executionCount, 0);
const avgSuccessRate = (workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length * 100).toFixed(0);

export function AutomationUniverse() {
  return (
    <div className="space-y-8 py-8">
      <div className="space-y-3">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-50">Automation & Agents Universe</h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl">
          Orchestrate workflows, triggers, actions, and autonomous bot agents at scale.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Active Workflows" value={activeWorkflows} />
        <StatCard label="Total Executions" value={totalExecutions} />
        <StatCard label="Avg Success Rate" value={`${avgSuccessRate}%`} />
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Automation Platform
            </p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Workflow Overview</h2>
          </div>
          <Badge size="sm" variant="info">Real-time</Badge>
        </div>
        <div className="space-y-3">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900 dark:text-slate-50">{workflow.name}</p>
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
              <p className="text-xs text-slate-600 dark:text-slate-400">{workflow.description}</p>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Executions</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{workflow.executionCount}</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Success Rate</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{(workflow.successRate * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Next Run</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-50">
                    {workflow.nextRun?.toLocaleString() ?? 'Manual'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-8">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Triggers</h2>
            <Button variant="secondary" size="sm">New Trigger</Button>
          </div>
          <div className="space-y-3">
            {triggers.map((trigger) => (
              <div key={trigger.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900 dark:text-slate-50">
                    {workflows.find((w) => w.id === trigger.workflowId)?.name ?? 'Unknown'}
                  </p>
                  <Badge size="sm" variant="default">{trigger.type}</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{trigger.condition}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Bot Agents</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-3">
              {bots.map((bot) => (
                <div key={bot.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">{bot.name}</p>
                    <Badge size="sm" variant="success">
                      {(bot.uptime * 100).toFixed(2)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {bot.capability} • {bot.tasksCompleted} tasks • Last: {bot.lastExecuted.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">System Health</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              All automation systems operating nominally with {bots.length} active agents.
            </p>
            <Button variant="primary" size="sm">View Dashboard</Button>
          </Card>
        </div>
      </div>

      <Card className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action) => (
            <div key={action.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900 dark:text-slate-50">
                  Step {action.order}
                </p>
                <Badge size="sm" variant="default">{action.type}</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {workflows.find((w) => w.id === action.workflowId)?.name ?? 'Unknown Workflow'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Config: {Object.keys(action.config).join(', ')}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
