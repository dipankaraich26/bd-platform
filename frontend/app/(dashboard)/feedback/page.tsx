'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { getSector, getSentiment, FEEDBACK_SENTIMENTS } from '@/lib/sector-config';
import { formatDate } from '@/lib/utils';
import { MessageSquare, Loader2, Search, Star, Trash2 } from 'lucide-react';

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (sentimentFilter) params.set('sentiment', sentimentFilter);
    api.get(`/feedback?${params.toString()}`)
      .then((r) => setFeedbacks(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sentimentFilter]);

  async function deleteFeedback(fid: string) {
    if (!confirm('Delete this feedback?')) return;
    await api.delete(`/feedback/${fid}`);
    setFeedbacks((prev) => prev.filter((f) => f.id !== fid));
  }

  const filtered = search
    ? feedbacks.filter((f) =>
        f.customerName.toLowerCase().includes(search.toLowerCase()) ||
        f.feedback.toLowerCase().includes(search.toLowerCase()) ||
        f.business?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : feedbacks;

  // Sentiment summary
  const sentimentCounts = FEEDBACK_SENTIMENTS.map((s) => ({
    ...s,
    count: feedbacks.filter((f) => f.sentiment === s.value).length,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer Feedback</h1>
        <p className="text-sm text-gray-500 mt-0.5">All feedback across businesses and projects</p>
      </div>

      {/* Summary cards */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sentimentCounts.map((s) => (
            <button
              key={s.value}
              onClick={() => setSentimentFilter(sentimentFilter === s.value ? '' : s.value)}
              className={`bg-white rounded-xl border p-4 text-center transition-colors hover:border-indigo-300 ${sentimentFilter === s.value ? 'border-indigo-400 ring-1 ring-indigo-400' : ''}`}
            >
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-xl font-bold text-gray-900">{s.count}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search feedback, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select value={sentimentFilter} onChange={(e) => setSentimentFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Sentiments</option>
          {FEEDBACK_SENTIMENTS.map((s) => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
        </select>
        <p className="text-sm text-gray-400 ml-auto">{filtered.length} entries</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-16 text-center">
          <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No feedback found</p>
          <p className="text-sm text-gray-400 mt-1">Add feedback from a business or project detail page</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((f: any) => {
            const sent = getSentiment(f.sentiment);
            const sec = getSector(f.business?.sector);
            return (
              <div key={f.id} className="bg-white rounded-xl border p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-2xl flex-shrink-0">{sent?.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{f.customerName}</p>
                        {f.customerOrg && <span className="text-xs text-gray-500">· {f.customerOrg}</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sent?.color}`}>{sent?.label}</span>
                        {f.rating && (
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < f.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Linked to */}
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        {f.business && (
                          <Link href={`/businesses/${f.business.id}`} className="flex items-center gap-1 text-indigo-600 hover:underline">
                            {sec?.icon} {f.business.name}
                          </Link>
                        )}
                        {f.project && (
                          <Link href={`/projects/${f.project.id}`} className="text-indigo-600 hover:underline">
                            · {f.project.type}: {f.project.name}
                          </Link>
                        )}
                        <span>· {formatDate(f.date)}</span>
                      </div>

                      <p className="text-sm text-gray-700 mt-2 leading-relaxed">{f.feedback}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteFeedback(f.id)} className="p-1.5 text-gray-300 hover:text-red-500 flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
