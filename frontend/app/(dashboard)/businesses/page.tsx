'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import {
  SECTORS, BUSINESS_STAGES, PRIORITIES, getSector, getStage, getPriority,
  formatCategoryLabel, scoreColor, scoreBg,
} from '@/lib/sector-config';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Search, Filter, ChevronRight, Loader2, Building2 } from 'lucide-react';

function BusinessesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const sector = searchParams.get('sector') || '';
  const stage = searchParams.get('stage') || '';
  const priority = searchParams.get('priority') || '';

  function buildQuery() {
    const params = new URLSearchParams();
    if (sector) params.set('sector', sector);
    if (stage) params.set('stage', stage);
    if (priority) params.set('priority', priority);
    if (search) params.set('search', search);
    return params.toString();
  }

  useEffect(() => {
    setLoading(true);
    api.get(`/businesses?${buildQuery()}`)
      .then((r) => setBusinesses(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sector, stage, priority]);

  function setFilter(key: string, val: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set(key, val);
    else params.delete(key);
    router.push(`/businesses?${params.toString()}`);
  }

  const filtered = search
    ? businesses.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
    : businesses;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Businesses</h1>
          <p className="text-sm text-gray-500 mt-0.5">All business ideas, ventures and sub-businesses</p>
        </div>
        <Link
          href="/businesses/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Business
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Sector */}
        <select
          value={sector}
          onChange={(e) => setFilter('sector', e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">All Sectors</option>
          {SECTORS.map((s) => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
        </select>

        {/* Stage */}
        <select
          value={stage}
          onChange={(e) => setFilter('stage', e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">All Stages</option>
          {BUSINESS_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {/* Priority */}
        <select
          value={priority}
          onChange={(e) => setFilter('priority', e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>

        {(sector || stage || priority) && (
          <button
            onClick={() => router.push('/businesses')}
            className="px-3 py-2 text-sm text-gray-500 hover:text-red-600 border rounded-lg"
          >
            Clear filters
          </button>
        )}

        <p className="text-sm text-gray-400 ml-auto">{filtered.length} results</p>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-16 text-center">
          <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No businesses found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting filters or add a new business</p>
          <Link href="/businesses/new" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
            Add Business
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b: any) => {
            const sec = getSector(b.sector);
            const stg = getStage(b.stage);
            const pri = getPriority(b.priority);
            return (
              <Link
                key={b.id}
                href={`/businesses/${b.id}`}
                className="block bg-white rounded-xl border hover:border-indigo-300 hover:shadow-sm transition-all p-5"
              >
                <div className="flex items-start gap-4">
                  {/* Sector icon */}
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl flex-shrink-0 ${sec?.bg ?? 'bg-gray-50'}`}>
                    {sec?.icon ?? '📁'}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-gray-900">{b.name}</h3>
                      {b.parentId && <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">Sub-business</span>}
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sec?.color ?? ''}`}>
                        {sec?.label}
                      </span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-600">{formatCategoryLabel(b.category)}</span>
                      {b.targetCustomer && (
                        <>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-500 truncate max-w-[200px]">{b.targetCustomer}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stg?.color}`}>{stg?.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pri?.color}`}>{pri?.label} Priority</span>
                      {b._count?.projects > 0 && (
                        <span className="text-xs text-gray-500">{b._count.projects} project{b._count.projects !== 1 ? 's' : ''}</span>
                      )}
                      {b._count?.children > 0 && (
                        <span className="text-xs text-gray-500">{b._count.children} sub-business{b._count.children !== 1 ? 'es' : ''}</span>
                      )}
                    </div>
                  </div>

                  {/* Right: score + value */}
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className={`h-full rounded-full ${scoreBg(b.score)}`} style={{ width: `${b.score}%` }} />
                      </div>
                      <span className={`text-base font-bold ${scoreColor(b.score)}`}>{b.score}</span>
                    </div>
                    {b.estimatedValue && (
                      <p className="text-sm font-semibold text-gray-700">{formatCurrency(b.estimatedValue, b.currency)}</p>
                    )}
                    {b.targetDate && (
                      <p className="text-xs text-gray-400 mt-0.5">Target: {formatDate(b.targetDate)}</p>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto mt-1" />
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

export default function BusinessesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>}>
      <BusinessesContent />
    </Suspense>
  );
}
