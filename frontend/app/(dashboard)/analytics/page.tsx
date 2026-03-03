'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getSector, getStage, SECTORS, BUSINESS_STAGES, scoreColor } from '@/lib/sector-config';
import { formatCurrency } from '@/lib/utils';
import { Loader2, TrendingUp, Award, Target } from 'lucide-react';

interface PipelineItem {
  stage: string;
  count: number;
  totalValue: number | string;
  avgScore: number;
}

interface SectorStat {
  sector: string;
  stage: string;
  _count: { id: number };
  _avg: { score: number | null };
  _sum: { estimatedValue: number | string | null };
}

export default function AnalyticsPage() {
  const [pipeline, setPipeline] = useState<PipelineItem[]>([]);
  const [sectorStats, setSectorStats] = useState<SectorStat[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/stats/pipeline'),
      api.get('/stats/sectors'),
      api.get('/stats/dashboard'),
    ]).then(([p, s, d]) => {
      setPipeline(p.data);
      setSectorStats(s.data);
      setDashboard(d.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  // Sector summary: group by sector
  const sectorSummary = SECTORS.map((sec) => {
    const rows = sectorStats.filter((s) => s.sector === sec.value);
    const total = rows.reduce((sum, r) => sum + (r._count?.id ?? 0), 0);
    const avgScore = total > 0
      ? Math.round(rows.reduce((sum, r) => sum + ((r._avg?.score ?? 0) * (r._count?.id ?? 0)), 0) / total)
      : 0;
    const totalValue = rows.reduce((sum, r) => sum + Number(r._sum?.estimatedValue ?? 0), 0);
    const won = rows.filter((r) => r.stage === 'WON').reduce((sum, r) => sum + (r._count?.id ?? 0), 0);
    const lost = rows.filter((r) => r.stage === 'LOST').reduce((sum, r) => sum + (r._count?.id ?? 0), 0);
    return { ...sec, total, avgScore, totalValue, won, lost };
  }).filter((s) => s.total > 0);

  // Pipeline funnel (exclude WON/LOST)
  const activePipeline = pipeline.filter((p) => !['WON', 'LOST'].includes(p.stage));
  const maxPipelineCount = Math.max(...activePipeline.map((p) => p.count), 1);

  // Win rate
  const totalClosed = pipeline.filter((p) => ['WON', 'LOST'].includes(p.stage)).reduce((s, p) => s + p.count, 0);
  const wonCount = pipeline.find((p) => p.stage === 'WON')?.count ?? 0;
  const winRate = totalClosed > 0 ? Math.round((wonCount / totalClosed) * 100) : 0;

  const totalActive = pipeline.filter((p) => !['WON', 'LOST'].includes(p.stage)).reduce((s, p) => s + p.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Business development metrics and pipeline analysis</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalActive}</p>
            <p className="text-sm text-gray-500">Active Pipeline Entries</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{winRate}%</p>
            <p className="text-sm text-gray-500">Win Rate (Won vs Closed)</p>
            <p className="text-xs text-gray-400">{wonCount} won of {totalClosed} closed</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{dashboard?.overview?.avgScore ?? 0}</p>
            <p className="text-sm text-gray-500">Average Opportunity Score</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Funnel */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Active Pipeline Funnel</h2>
          <div className="space-y-3">
            {activePipeline.map((item) => {
              const stage = getStage(item.stage);
              const pct = (item.count / maxPipelineCount) * 100;
              return (
                <div key={item.stage} className="flex items-center gap-3">
                  <div className="w-28 text-xs text-gray-600 text-right flex-shrink-0">{stage?.label ?? item.stage}</div>
                  <div className="flex-1 bg-gray-50 rounded-full h-8 overflow-hidden relative">
                    <div
                      className={`h-full rounded-full flex items-center px-3 ${stage?.color ?? 'bg-gray-100'}`}
                      style={{ width: `${Math.max(pct, 6)}%` }}
                    />
                    <div className="absolute inset-0 flex items-center px-3">
                      <span className="text-xs font-semibold text-gray-700">
                        {item.count} {item.count === 1 ? 'entry' : 'entries'}
                        {Number(item.totalValue) > 0 && ` · ${formatCurrency(item.totalValue)}`}
                      </span>
                    </div>
                  </div>
                  <div className={`w-10 text-xs font-bold text-right flex-shrink-0 ${scoreColor(item.avgScore)}`}>
                    {item.avgScore}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-4 pt-3 border-t">
            <span>Count</span>
            <span>Score</span>
          </div>
        </div>

        {/* Won vs Lost */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Won vs Lost</h2>
          {totalClosed === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              No closed businesses yet
            </div>
          ) : (
            <>
              <div className="flex rounded-xl overflow-hidden h-12 mb-4">
                <div
                  className="bg-emerald-500 flex items-center justify-center text-white text-sm font-bold"
                  style={{ width: `${winRate}%` }}
                >
                  {wonCount > 0 && `${wonCount} Won`}
                </div>
                <div
                  className="bg-red-400 flex items-center justify-center text-white text-sm font-bold"
                  style={{ width: `${100 - winRate}%` }}
                >
                  {(totalClosed - wonCount) > 0 && `${totalClosed - wonCount} Lost`}
                </div>
              </div>
              <div className="space-y-3">
                {pipeline.filter((p) => ['WON', 'LOST'].includes(p.stage)).map((p) => (
                  <div key={p.stage} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${p.stage === 'WON' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                      <span className="text-sm font-medium text-gray-700">{p.stage}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{p.count} businesses</p>
                      {Number(p.totalValue) > 0 && (
                        <p className="text-xs text-gray-500">{formatCurrency(p.totalValue)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sector breakdown table */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Sector Breakdown</h2>
        {sectorSummary.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No businesses added yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Sector</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Won</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Lost</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Win Rate</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Avg Score</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Est. Pipeline Value</th>
                </tr>
              </thead>
              <tbody>
                {sectorSummary.map((s) => {
                  const closed = s.won + s.lost;
                  const wr = closed > 0 ? Math.round((s.won / closed) * 100) : null;
                  return (
                    <tr key={s.value} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{s.icon}</span>
                          <span className="font-medium text-gray-900">{s.label}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-semibold">{s.total}</td>
                      <td className="py-3 px-3 text-center text-emerald-600 font-semibold">{s.won}</td>
                      <td className="py-3 px-3 text-center text-red-500 font-semibold">{s.lost}</td>
                      <td className="py-3 px-3 text-center">
                        {wr !== null ? (
                          <span className={`font-semibold ${wr >= 60 ? 'text-emerald-600' : wr >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>{wr}%</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`font-bold ${scoreColor(s.avgScore)}`}>{s.avgScore}</span>
                      </td>
                      <td className="py-3 px-3 text-right text-gray-700 font-medium">
                        {s.totalValue > 0 ? formatCurrency(s.totalValue) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stage distribution per sector */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Stage Distribution by Sector</h2>
        <div className="space-y-4">
          {sectorSummary.map((sec) => {
            const secRows = sectorStats.filter((s) => s.sector === sec.value);
            const total = secRows.reduce((sum, r) => sum + (r._count?.id ?? 0), 0);
            return (
              <div key={sec.value}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span>{sec.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{sec.label}</span>
                  <span className="text-xs text-gray-400">({total} total)</span>
                </div>
                <div className="flex h-6 rounded-full overflow-hidden gap-0.5">
                  {BUSINESS_STAGES.map((stage) => {
                    const row = secRows.find((r) => r.stage === stage.value);
                    const cnt = row?._count?.id ?? 0;
                    const pct = total > 0 ? (cnt / total) * 100 : 0;
                    if (pct === 0) return null;
                    return (
                      <div
                        key={stage.value}
                        title={`${stage.label}: ${cnt}`}
                        className={`${stage.color.replace('text-', 'bg-').replace('-700', '-400').replace('-100', '-300')} flex items-center justify-center text-[10px] font-bold text-white`}
                        style={{ width: `${pct}%` }}
                      >
                        {pct > 8 && cnt}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3 mt-1 flex-wrap">
                  {BUSINESS_STAGES.map((stage) => {
                    const row = secRows.find((r) => r.stage === stage.value);
                    const cnt = row?._count?.id ?? 0;
                    if (cnt === 0) return null;
                    return (
                      <span key={stage.value} className={`text-[10px] px-1.5 py-0.5 rounded ${stage.color}`}>
                        {stage.label}: {cnt}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
