'use client';

import { Card } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/aurora/Button';
import { StatCard } from '@/components/aurora/StatCard';
import { AuroraDataService } from '@/data/types';

const models = AuroraDataService.getAiModels();
const conversations = AuroraDataService.getAiConversations();
const agents = AuroraDataService.getAiAgents();

const activeConversations = conversations.filter((c) => c.status === 'active');
const totalMessages = conversations.reduce((sum, c) => sum + c.messageCount, 0);

export function AiUniverse() {
  return (
    <div className="space-y-8 py-8">
      <div className="space-y-3">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-50">AI Universe</h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl">
          Harness reasoning, generation, analysis, and synthesis across intelligent agents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="AI Models" value={models.length} />
        <StatCard label="Active Conversations" value={activeConversations.length} />
        <StatCard label="Total Messages" value={totalMessages} />
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Intelligence Platform
            </p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Model Performance</h2>
          </div>
          <Badge size="sm" variant="info">Real-time</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((model) => (
            <div key={model.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900 dark:text-slate-50">{model.name}</p>
                <Badge size="sm" variant="primary">{model.provider}</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {model.capability} • ${model.costPerRequest.toFixed(4)}/req
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Performance</span>
                  <span>{(model.performanceScore * 10).toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600"
                    style={{ width: `${model.performanceScore * 10}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-8">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Conversations</h2>
            <Button variant="secondary" size="sm">New Chat</Button>
          </div>
          <div className="space-y-3">
            {conversations.slice(0, 5).map((conv) => (
              <div key={conv.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{conv.title}</p>
                  <Badge
                    size="sm"
                    variant={conv.status === 'active' ? 'success' : 'default'}
                  >
                    {conv.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {conv.messageCount} messages • {conv.lastMessageAt.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Agents</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-3">
              {agents.map((agent) => (
                <div key={agent.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 dark:text-slate-50">{agent.name}</p>
                    <Badge size="sm" variant={agent.status === 'active' ? 'success' : 'warning'}>
                      {agent.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {agent.taskCount} tasks • {(agent.accuracy * 100).toFixed(0)}% accuracy
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Agent Insights</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your AI agents are performing 18% better than last week.
            </p>
            <Button variant="primary" size="sm">View Details</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
