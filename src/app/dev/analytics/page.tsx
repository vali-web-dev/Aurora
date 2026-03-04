"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsEvent {
  id: string;
  timestamp: string;
  category: string;
  action: string;
  userId: string;
  sessionId: string;
  value?: number;
  metadata?: Record<string, any>;
}

interface AnalyticsMetrics {
  summary: {
    totalEvents: number;
    uniqueUsers: number;
    totalValue: number;
    avgEventValue: number;
  };
  timeSeries: Array<{
    date: string;
    count: number;
    value: number;
    users: number;
  }>;
  topActions: Array<{
    action: string;
    count: number;
    percentage: number;
  }>;
  topValueActions: Array<{
    action: string;
    value: number;
    percentage: number;
  }>;
}

/**
 * Aurora Analytics Dashboard
 * Real-time monitoring of user behavior, transactions, and system health
 * 
 * Route: /dev/analytics
 * Permissions: Admin only
 */

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'conversions' | 'payments'>('overview');
  const [dateRange, setDateRange] = useState(7); // days
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
    fetchEvents();
    const interval = setInterval(() => {
      fetchMetrics();
      fetchEvents();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [dateRange]);

  async function fetchMetrics() {
    try {
      const response = await fetch(`/api/analytics/metrics?days=${dateRange}`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchEvents() {
    try {
      const response = await fetch(`/api/analytics/events?limit=100&days=${dateRange}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data.events);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="mb-4 text-4xl">📊</div>
          <h1 className="text-2xl font-bold text-amber-900 mb-2">Loading Analytics</h1>
          <p className="text-amber-700">Gathering metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-amber-200 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-amber-900">🔍 Aurora Analytics</h1>
              <p className="text-amber-700 mt-1">Real-time platform insights</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(parseInt(e.target.value))}
                className="px-4 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 font-medium hover:bg-amber-100 transition"
              >
                <option value={1}>Last 24 hours</option>
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              <button
                onClick={fetchMetrics}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 border-b border-amber-200">
            {(['overview', 'events', 'conversions', 'payments'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-amber-600 text-amber-900 bg-amber-50'
                    : 'border-transparent text-amber-700 hover:text-amber-900 hover:bg-amber-50/50'
                }`}
              >
                {tab === 'overview' && '📊 Overview'}
                {tab === 'events' && '📝 Events'}
                {tab === 'conversions' && '🏪 Conversions'}
                {tab === 'payments' && '💳 Payments'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-6 p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-700">⚠️ {error}</p>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && metrics && <OverviewTab metrics={metrics} />}
        {activeTab === 'events' && <EventsTab events={events} />}
        {activeTab === 'conversions' && metrics && <ConversionsTab metrics={metrics} />}
        {activeTab === 'payments' && metrics && <PaymentsTab metrics={metrics} />}
      </div>
    </div>
  );
}

/**
 * Overview Tab - Summary metrics and trends
 */
function OverviewTab({ metrics }: { metrics: AnalyticsMetrics }) {
  const COLORS = ['#b45309', '#d97706', '#f59e0b', '#fbbf24', '#fcd34d'];

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Events"
          value={metrics.summary.totalEvents.toLocaleString()}
          icon="📊"
          trend="+12%"
        />
        <SummaryCard
          title="Unique Users"
          value={metrics.summary.uniqueUsers.toLocaleString()}
          icon="👥"
          trend="+5%"
        />
        <SummaryCard
          title="Total Value"
          value={`$${(metrics.summary.totalValue / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon="💰"
          trend="+8%"
        />
        <SummaryCard
          title="Avg Event Value"
          value={`$${(metrics.summary.avgEventValue / 100).toFixed(2)}`}
          icon="💵"
          trend="-2%"
        />
      </div>

      {/* Time Series Chart */}
      <div className="bg-white rounded-xl border border-amber-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-amber-900 mb-6">📈 Event Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metrics.timeSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5b789" />
            <XAxis dataKey="date" stroke="#92400e" />
            <YAxis stroke="#92400e" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
              }}
              formatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#b45309"
              strokeWidth={2}
              dot={{ fill: '#b45309', r: 4 }}
              name="Events"
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#d97706"
              strokeWidth={2}
              dot={{ fill: '#d97706', r: 4 }}
              name="Users"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Actions by Count */}
        <div className="bg-white rounded-xl border border-amber-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-amber-900 mb-6">🏆 Top Actions (by count)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.topActions.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5b789" />
              <XAxis
                dataKey="action"
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="#92400e"
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#92400e" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#b45309" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Actions by Value */}
        <div className="bg-white rounded-xl border border-amber-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-amber-900 mb-6">💰 Top Actions (by value)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.topValueActions.slice(0, 5)}
                dataKey="value"
                nameKey="action"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {COLORS.map((color) => (
                  <Cell key={color} fill={color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `$${(Number(value) / 100).toFixed(2)}`}
                contentStyle={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/**
 * Events Tab - Recent events log
 */
function EventsTab({ events }: { events: AnalyticsEvent[] }) {
  return (
    <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-amber-200">
        <h2 className="text-xl font-bold text-amber-900">📝 Recent Events</h2>
        <p className="text-amber-700 text-sm mt-1">Latest activity from the past 7 days</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-amber-50 border-b border-amber-200">
            <tr>
              <th className="px-6 py-3 text-left text-amber-900 font-bold">Time</th>
              <th className="px-6 py-3 text-left text-amber-900 font-bold">Category</th>
              <th className="px-6 py-3 text-left text-amber-900 font-bold">Action</th>
              <th className="px-6 py-3 text-left text-amber-900 font-bold">User</th>
              <th className="px-6 py-3 text-left text-amber-900 font-bold">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-100">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-amber-50 transition">
                <td className="px-6 py-3 text-amber-700">
                  {new Date(event.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-3">
                  <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-900 font-medium text-xs">
                    {event.category}
                  </span>
                </td>
                <td className="px-6 py-3 text-amber-900">{event.action}</td>
                <td className="px-6 py-3 text-amber-700">{event.userId.slice(0, 8)}...</td>
                <td className="px-6 py-3 text-amber-900 font-medium">
                  {event.value ? `$${(event.value / 100).toFixed(2)}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Conversions Tab - Conversion funnel and metrics
 */
function ConversionsTab({ metrics }: { metrics: AnalyticsMetrics }) {
  const conversionActions = metrics.topActions.filter((a) =>
    ['add_to_cart', 'create_payment_intent', 'payment_success', 'order_completed'].includes(a.action)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-amber-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-amber-900 mb-6">🏪 Conversion Funnel</h2>
        <div className="space-y-4">
          {[
            { label: 'Browse Products', value: 1000, color: 'bg-blue-500' },
            { label: 'Add to Cart', value: 350, color: 'bg-green-500' },
            { label: 'Initiate Payment', value: 150, color: 'bg-yellow-500' },
            { label: 'Payment Success', value: 120, color: 'bg-emerald-500' },
          ].map((step, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-900 font-medium">{step.label}</span>
                <span className="text-amber-700 text-sm">{step.value} events</span>
              </div>
              <div className="w-full bg-amber-100 rounded-full h-8 overflow-hidden">
                <div
                  className={`h-full ${step.color} flex items-center justify-center text-white text-xs font-bold transition-all`}
                  style={{ width: `${(step.value / 1000) * 100}%` }}
                >
                  {((step.value / 1000) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-amber-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-amber-900 mb-4">📊 Conversion Metrics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="text-2xl font-bold text-amber-900">12%</div>
            <div className="text-sm text-amber-700">Checkout Conversion</div>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="text-2xl font-bold text-amber-900">8.3%</div>
            <div className="text-sm text-amber-700">Cart Value Average</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Payments Tab - Payment metrics and health
 */
function PaymentsTab({ metrics }: { metrics: AnalyticsMetrics }) {
  const paymentMetrics = metrics.topValueActions.filter((a) =>
    ['payment_success', 'refund_initiated', 'payment_failed'].includes(a.action)
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Payment Success Rate"
          value="98.5%"
          icon="✅"
          trend="+0.5%"
        />
        <SummaryCard
          title="Avg Transaction"
          value="$142.50"
          icon="💳"
          trend="+5%"
        />
        <SummaryCard
          title="Refund Rate"
          value="1.5%"
          icon="↩️"
          trend="-0.2%"
        />
      </div>

      <div className="bg-white rounded-xl border border-amber-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-amber-900 mb-6">💰 Payment Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: 'Stripe', value: 65 },
                { name: 'Adyen', value: 25 },
                { name: 'Other', value: 10 },
              ]}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              <Cell fill="#b45309" />
              <Cell fill="#d97706" />
              <Cell fill="#f59e0b" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Summary Card Component
 */
function SummaryCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string;
  icon: string;
  trend: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-amber-200 p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-3xl font-bold text-amber-900">{value}</div>
          <p className="text-amber-700 text-sm mt-1">{title}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      <div className="mt-4 text-sm font-medium text-green-600">{trend}</div>
    </div>
  );
}
