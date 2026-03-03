'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { getSector, getProjectStatus, formatCategoryLabel, scoreColor, scoreBg } from '@/lib/sector-config';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FolderKanban, Search, Loader2 } from 'lucide-react';

const STATUSES = ['CONCEPT','PROPOSAL','DEVELOPMENT','TESTING','DEPLOYED','ON_HOLD','CANCELLED'];
const TYPES = ['PROJECT','PROGRAM','PRODUCT','SOLUTION','POC','PILOT'];

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8">{progress}%</span>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (typeFilter) params.set('type', typeFilter);
    api.get(`/projects?${params.toString()}`)
      .then((r) => setProjects(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [statusFilter, typeFilter]);

  const filtered = search
    ? projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.business?.name?.toLowerCase().includes(search.toLowerCase()))
    : projects;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects & Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">All projects, programs, products and solutions across businesses</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <p className="text-sm text-gray-400 ml-auto">{filtered.length} results</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-16 text-center">
          <FolderKanban className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No projects found</p>
          <p className="text-sm text-gray-400 mt-1">Add projects from inside a business detail page</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p: any) => {
            const pst = getProjectStatus(p.status);
            const sec = getSector(p.business?.sector);
            return (
              <Link key={p.id} href={`/projects/${p.id}`} className="block bg-white rounded-xl border hover:border-indigo-300 hover:shadow-sm transition-all p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl flex-shrink-0 ${sec?.bg ?? 'bg-gray-50'}`}>
                    {sec?.icon ?? '📁'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{p.name}</p>
                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{p.type}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${pst?.color}`}>{pst?.label}</span>
                      <span className="text-xs text-gray-400">·</span>
                      {p.business && (
                        <span className="text-xs text-indigo-600">{p.business.name}</span>
                      )}
                      {p.customer && <span className="text-xs text-gray-400">· {p.customer}</span>}
                    </div>
                    {p.description && <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">{p.description}</p>}
                    <div className="mt-2">
                      <ProgressBar progress={p.progress} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <div className="w-14 bg-gray-100 rounded-full h-1.5">
                        <div className={`h-full rounded-full ${scoreBg(p.score)}`} style={{ width: `${p.score}%` }} />
                      </div>
                      <span className={`text-sm font-bold ${scoreColor(p.score)}`}>{p.score}</span>
                    </div>
                    {p.budget && <p className="text-xs text-gray-400">{formatCurrency(p.budget)}</p>}
                    {p.endDate && <p className="text-xs text-gray-400 mt-0.5">Due {formatDate(p.endDate)}</p>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
