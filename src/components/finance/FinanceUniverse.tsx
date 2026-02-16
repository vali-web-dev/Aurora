'use client';

import { Card, CardTitle } from '@/components/aurora/Card';
import { Badge } from '@/components/aurora/Badge';
import { Button } from '@/components/aurora/Button';
import { StatCard } from '@/components/aurora/StatCard';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { AuroraDataService } from '@/data/types';
import { formatDate } from '@/lib/utils';

const accounts = AuroraDataService.getFinanceAccounts();
const transactions = AuroraDataService.getTransactions();
const budgets = AuroraDataService.getFinanceBudgets();
const investments = AuroraDataService.getInvestments();
const insights = AuroraDataService.getFinanceInsights();

const totalBalance = accounts.reduce((sum, acc) => sum + acc.balanceCents, 0);
const totalInvested = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
const totalGainLoss = investments.reduce((sum, inv) => sum + inv.gainLoss, 0);
const gainLossLabel = totalGainLoss >= 0 ? '+' : '-';
const absGainLoss = Math.abs(totalGainLoss);

export function FinanceUniverse() {
  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Finance Universe"
        description="Unified banking, budgeting, investing, and wealth intelligence."
      />

      <SurfaceSection title="Portfolio Overview">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total Balance" value={`$${(totalBalance / 100).toFixed(0)}k`} helper="Across accounts" />
          <StatCard label="Invested" value={`$${(totalInvested / 100).toFixed(0)}k`} helper="Market value" />
          <StatCard label="Gain/Loss" value={`${gainLossLabel}$${(absGainLoss / 100).toFixed(0)}`} helper="YTD" />
        </div>
      </SurfaceSection>

      <SurfaceSection title="Asset Allocation" description="Portfolio snapshot across connected accounts.">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="aurora-label text-slate-500 dark:text-slate-400">
                Portfolio Snapshot
              </p>
              <CardTitle>Asset Allocation</CardTitle>
            </div>
            <Badge size="sm" variant="success">+{(totalGainLoss > 0 ? totalGainLoss / totalInvested * 100 : 0).toFixed(1)}% YTD</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <div key={account.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2">
                <p className="aurora-label text-slate-900 dark:text-slate-50">{account.name}</p>
                <p className="aurora-label text-2xl font-bold text-slate-900 dark:text-slate-50">
                  ${(account.balanceCents / 100).toFixed(0)}
                </p>
                <Badge size="sm" variant="default">{account.type}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </SurfaceSection>

      <SurfaceSection title="Transactions & Budgets">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-8">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Button variant="secondary" size="sm">View All</Button>
            </div>
            <div className="space-y-2" role="list" aria-label="Recent transactions">
              {transactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  role="listitem"
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                >
                  <div>
                    <p className="aurora-label text-slate-900 dark:text-slate-50">{tx.description}</p>
                    <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">{formatDate(tx.date)}</p>
                  </div>
                  <Badge size="sm" variant={tx.category === 'income' ? 'success' : 'default'}>
                    {tx.category === 'income' ? '+' : ''} ${(tx.amountCents / 100).toFixed(2)}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="space-y-4">
              <CardTitle>Budget Status</CardTitle>
              <div className="space-y-3">
                {budgets.map((budget) => {
                  const percent = Math.round((budget.spentCents / budget.limitCents) * 100);
                  return (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="aurora-label text-sm text-slate-900 dark:text-slate-50">{budget.name}</p>
                        <span className="aurora-label text-xs text-slate-600 dark:text-slate-400">{percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${percent > 80 ? 'bg-red-500' : percent > 60 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="space-y-4">
              <CardTitle>Smart Insights</CardTitle>
              <div className="space-y-3">
                {insights.map((insight) => (
                  <div key={insight.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="aurora-label text-sm text-slate-900 dark:text-slate-50">{insight.title}</p>
                      <Badge size="sm" variant={insight.priority === 'high' ? 'error' : 'default'}>
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="aurora-label text-xs text-slate-600 dark:text-slate-400">{insight.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </SurfaceSection>

      <SurfaceSection title="Investments">
        <Card className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {investments.map((inv) => {
              const gainLossPct = ((inv.gainLoss / inv.costBasis) * 100).toFixed(1);
              return (
                <div key={inv.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2">
                  <p className="aurora-label text-slate-900 dark:text-slate-50">{inv.symbol}</p>
                  <p className="aurora-label text-2xl font-bold text-slate-900 dark:text-slate-50">
                    ${(inv.currentValue / 100).toFixed(0)}
                  </p>
                  <Badge size="sm" variant={inv.gainLoss > 0 ? 'success' : 'error'}>
                    {inv.gainLoss > 0 ? '+' : ''} ${(inv.gainLoss / 100).toFixed(0)} ({gainLossPct}%)
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </SurfaceSection>
    </Surface>
  );
}
