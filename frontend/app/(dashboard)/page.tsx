'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
  getSector, getStage, getSentiment, formatCategoryLabel, scoreColor, scoreBg,
  BUSINESS_STAGES
} from '@/lib/sector-config';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Briefcase, FolderKanban, TrendingUp, MessageSquare, Calendar, ChevronRight, Loader2 } from 'lucide-react';

interface DashboardData {
  overview: {
    totalBusinesses: number;
    totalProjects: number;
    avgScore: number;
    totalFeedback: number;
    pipelineValue: number;
    wonValue: number;
  };
  businessesByStage: { stage: string; count: number }[];
  businessesBySector: { sector: string; count: number; avgScore: number }[];
  projectsByStatus: { status: string; count: number }[];
  feedbackBySentiment: { sentiment: string; count: number }[];
  recentActivities: any[];
  upcomingMilestones: any[];
  topBusinesses: any[];
}

function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats/dashboard')
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!data) return <div className="text-gray-500">Failed to load dashboard</div>;

  const { overview, businessesByStage, businessesBySector, topBusinesses, recentActivities, upcomingMilestones, feedbackBySentiment } = data;

  // Stage pipeline ordered
  const stageOrder = ['IDEA', 'EXPLORING', 'PROPOSAL', 'NEGOTIATION', 'ACTIVE', 'ON_HOLD', 'WON', 'LOST'];
  const stageMap = Object.fromEntries(businessesByStage.map((b) => [b.stage, b.count]));
  const maxStageCount = Math.max(...businessesByStage.map((b) => b.count), 1);

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Business Development Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Portfolio overview across all sectors</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Businesses"
          value={overview.totalBusinesses}
          icon={Briefcase}
          color="bg-indigo-600"
        />
        <KpiCard
          label="Total Projects"
          value={overview.totalProjects}
          icon={FolderKanban}
          color="bg-blue-600"
        />
        <KpiCard
          label="Avg Opportunity Score"
          value={`${overview.avgScore}/100`}
          icon={TrendingUp}
          color="bg-emerald-600"
        />
        <KpiCard
          label="Customer Feedback"
          value={overview.totalFeedback}
          icon={MessageSquare}
          color="bg-violet-600"
        />
      </div>

      {/* Pipeline value row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-indigo-600 text-white rounded-xl p-5">
          <p className="text-sm text-indigo-200">Active Pipeline Value</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(overview.pipelineValue)}</p>
          <p className="text-xs text-indigo-300 mt-1">Businesses not yet Won or Lost</p>
        </div>
        <div className="bg-emerald-600 text-white rounded-xl p-5">
          <p className="text-sm text-emerald-200">Total Won Value</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(overview.wonValue)}</p>
          <p className="text-xs text-emerald-300 mt-1">Closed Won businesses</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline funnel */}
        <div className="lg:col-span-2 bg-white rounded-xl border p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Business Stage Pipeline</h2>
          <div className="space-y-2.5">
            {stageOrder.map((stage) => {
              const count = stageMap[stage] || 0;
              const meta = getStage(stage);
              const pct = (count / maxStageCount) * 100;
              return (
                <div key={stage} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-gray-600 text-right flex-shrink-0">{meta?.label ?? stage}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className={`h-full rounded-full flex items-center px-2 transition-all ${meta?.color ?? 'bg-gray-200'}`}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                  <div className="w-8 text-xs font-bold text-gray-700 flex-shrink-0">{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sector breakdown */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">By Sector</h2>
          <div className="space-y-3">
            {businessesBySector.map((s) => {
              const sec = getSector(s.sector);
              return (
                <Link key={s.sector} href={`/businesses?sector=${s.sector}`} className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1.5 transition-colors">
                  <span className="text-xl">{sec?.icon ?? '📁'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{sec?.label ?? s.sector}</p>
                    <p className="text-xs text-gray-500">{s.count} {s.count === 1 ? 'business' : 'businesses'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${scoreColor(s.avgScore)}`}>{s.avgScore}</p>
                    <p className="text-[10px] text-gray-400">avg score</p>
                  </div>
                </Link>
              );
            })}
            {businessesBySector.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No businesses yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top businesses by score */}
        <div className="lg:col-span-2 bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Top Opportunities</h2>
            <Link href="/businesses" className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {topBusinesses.map((b: any) => {
              const sec = getSector(b.sector);
              const stage = getStage(b.stage);
              return (
                <Link key={b.id} href={`/businesses/${b.id}`} className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 border" style={{ background: '#f8f9fa' }}>
                    {sec?.icon ?? '📁'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{b.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${stage?.color}`}>{stage?.label}</span>
                      <span className="text-xs text-gray-500">{formatCategoryLabel(b.category)}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1.5 justify-end">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${scoreBg(b.score)}`} style={{ width: `${b.score}%` }} />
                      </div>
                      <span className={`text-sm font-bold ${scoreColor(b.score)}`}>{b.score}</span>
                    </div>
                    {b.estimatedValue && (
                      <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(b.estimatedValue)}</p>
                    )}
                  </div>
                </Link>
              );
            })}
            {topBusinesses.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No businesses added yet.<br />
                <Link href="/businesses/new" className="text-indigo-600 hover:underline">Add your first business</Link>
              </p>
            )}
          </div>
        </div>

        {/* Right column: milestones + feedback */}
        <div className="space-y-6">
          {/* Upcoming milestones */}
          <div className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Upcoming Milestones</h2>
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              {upcomingMilestones.slice(0, 5).map((m: any) => (
                <div key={m.id} className="flex gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${m.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 leading-snug">{m.title}</p>
                    <p className="text-[10px] text-gray-500">{m.business?.name ?? m.project?.name}</p>
                    <p className="text-[10px] text-orange-600 font-medium">{formatDate(m.dueDate)}</p>
                  </div>
                </div>
              ))}
              {upcomingMilestones.length === 0 && (
                <p className="text-xs text-gray-400">No upcoming milestones</p>
              )}
            </div>
          </div>

          {/* Feedback sentiment */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Feedback Sentiment</h2>
            <div className="space-y-2">
              {feedbackBySentiment.map((f: any) => {
                const sent = getSentiment(f.sentiment);
                const total = feedbackBySentiment.reduce((s, x) => s + x.count, 0);
                const pct = total > 0 ? Math.round((f.count / total) * 100) : 0;
                return (
                  <div key={f.sentiment} className="flex items-center gap-2">
                    <span className="text-base">{sent?.icon ?? '•'}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                        <span>{sent?.label ?? f.sentiment}</span>
                        <span className="font-medium">{f.count}</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-full rounded-full ${sent?.color.replace('text-', 'bg-').replace('-100', '-400').replace('-700', '-500') ?? 'bg-gray-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              {feedbackBySentiment.length === 0 && (
                <p className="text-xs text-gray-400">No feedback yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivities.map((a: any) => (
            <div key={a.id} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-indigo-600">
                {a.user?.name ? a.user.name[0] : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">{a.description}</p>
                <p className="text-xs text-gray-400">
                  {a.business?.name && <span className="text-indigo-600">{a.business.name} · </span>}
                  {new Date(a.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {recentActivities.length === 0 && (
            <p className="text-sm text-gray-400">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
