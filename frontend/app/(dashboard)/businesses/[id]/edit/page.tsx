'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import {
  SECTORS, SECTOR_CATEGORIES, BUSINESS_STAGES, PRODUCT_NATURES, PRIORITIES,
  formatCategoryLabel, Sector,
} from '@/lib/sector-config';
import { ArrowLeft, Loader2 } from 'lucide-react';

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function EditBusinessPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    api.get(`/businesses/${id}`).then((r) => {
      const b = r.data;
      setForm({
        name: b.name,
        description: b.description || '',
        sector: b.sector,
        category: b.category,
        productNature: b.productNature,
        stage: b.stage,
        score: b.score,
        priority: b.priority,
        targetCustomer: b.targetCustomer || '',
        targetMarket: b.targetMarket || '',
        estimatedValue: b.estimatedValue ? String(b.estimatedValue) : '',
        currency: b.currency || 'INR',
        startDate: b.startDate ? b.startDate.split('T')[0] : '',
        targetDate: b.targetDate ? b.targetDate.split('T')[0] : '',
        notes: b.notes || '',
        tags: Array.isArray(b.tags) ? b.tags.join(', ') : '',
      });
    }).finally(() => setLoading(false));
  }, [id]);

  const categories = form ? (SECTOR_CATEGORIES[form.sector as Sector] || ['GENERAL']) : ['GENERAL'];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/businesses/${id}`, {
        ...form,
        score: Number(form.score),
        estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : null,
        startDate: form.startDate || null,
        targetDate: form.targetDate || null,
        tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      });
      router.push(`/businesses/${id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update business');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/businesses/${id}`} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Business</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 pb-2 border-b">Business Information</h2>
          <FormField label="Name" required>
            <input className="input-base" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </FormField>
          <FormField label="Description">
            <textarea className="input-base" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Sector" required>
              <select className="input-base" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value, category: 'GENERAL' })}>
                {SECTORS.map((s) => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
              </select>
            </FormField>
            <FormField label="Category" required>
              <select className="input-base" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((c) => <option key={c} value={c}>{formatCategoryLabel(c)}</option>)}
              </select>
            </FormField>
            <FormField label="Product Nature">
              <select className="input-base" value={form.productNature} onChange={(e) => setForm({ ...form, productNature: e.target.value })}>
                {PRODUCT_NATURES.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
              </select>
            </FormField>
            <FormField label="Stage">
              <select className="input-base" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
                {BUSINESS_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </FormField>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 pb-2 border-b">Scoring & Priority</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label={`Score: ${form.score}/100`}>
              <input type="range" min="0" max="100" value={form.score} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} className="w-full accent-indigo-600" />
            </FormField>
            <FormField label="Priority">
              <div className="grid grid-cols-2 gap-2">
                {PRIORITIES.map((p) => (
                  <button key={p.value} type="button" onClick={() => setForm({ ...form, priority: p.value })}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${form.priority === p.value ? p.color + ' border-current' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </FormField>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 pb-2 border-b">Market & Customer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Target Customer">
              <input className="input-base" value={form.targetCustomer} onChange={(e) => setForm({ ...form, targetCustomer: e.target.value })} />
            </FormField>
            <FormField label="Target Market">
              <input className="input-base" value={form.targetMarket} onChange={(e) => setForm({ ...form, targetMarket: e.target.value })} />
            </FormField>
            <FormField label="Estimated Value">
              <div className="flex gap-2">
                <select className="input-base w-24 flex-shrink-0" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                  <option value="INR">INR</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option>
                </select>
                <input type="number" className="input-base flex-1" value={form.estimatedValue} onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })} />
              </div>
            </FormField>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 pb-2 border-b">Timeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Start Date">
              <input type="date" className="input-base" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </FormField>
            <FormField label="Target Date">
              <input type="date" className="input-base" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
            </FormField>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 pb-2 border-b">Notes & Tags</h2>
          <FormField label="Notes">
            <textarea className="input-base" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </FormField>
          <FormField label="Tags (comma-separated)">
            <input className="input-base" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="e.g. strategic, defence, priority" />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pb-8">
          <Link href={`/businesses/${id}`} className="px-5 py-2.5 border rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
