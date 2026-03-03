'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

function NewBusinessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = searchParams.get('parentId') || '';
  const defaultSector = (searchParams.get('sector') || '') as Sector;

  const [saving, setSaving] = useState(false);
  const [parentBusiness, setParentBusiness] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    sector: defaultSector || 'DEFENCE' as Sector,
    category: 'GENERAL',
    productNature: 'ELECTRONIC',
    stage: 'IDEA',
    score: 50,
    priority: 'MEDIUM',
    targetCustomer: '',
    targetMarket: '',
    estimatedValue: '',
    currency: 'INR',
    startDate: '',
    targetDate: '',
    notes: '',
    tags: '',
    parentId: parentId,
  });

  useEffect(() => {
    if (parentId) {
      api.get(`/businesses/${parentId}`).then((r) => setParentBusiness(r.data)).catch(console.error);
    }
  }, [parentId]);

  // Reset category when sector changes
  useEffect(() => {
    setForm((f) => ({ ...f, category: 'GENERAL' }));
  }, [form.sector]);

  const categories = SECTOR_CATEGORIES[form.sector as Sector] || ['GENERAL'];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        score: Number(form.score),
        estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : null,
        startDate: form.startDate || null,
        targetDate: form.targetDate || null,
        parentId: form.parentId || null,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      const r = await api.post('/businesses', payload);
      router.push(`/businesses/${r.data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create business');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/businesses" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {parentId ? 'New Sub-Business' : 'New Business'}
          </h1>
          {parentBusiness && (
            <p className="text-sm text-gray-500 mt-0.5">Under: <span className="text-indigo-600 font-medium">{parentBusiness.name}</span></p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Core info */}
        <div className="bg-white rounded-xl border p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 pb-2 border-b">Business Information</h2>

          <FormField label="Business / Product Name" required>
            <input
              className="input-base"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Radar Solutions, ICU Ventilator Product Line"
              required
            />
          </FormField>

          <FormField label="Description">
            <textarea
              className="input-base"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of this business or product focus..."
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Sector" required>
              <select
                className="input-base"
                value={form.sector}
                onChange={(e) => setForm({ ...form, sector: e.target.value as Sector })}
              >
                {SECTORS.map((s) => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
              </select>
            </FormField>

            <FormField label="Category" required>
              <select
                className="input-base"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((c) => <option key={c} value={c}>{formatCategoryLabel(c)}</option>)}
              </select>
            </FormField>

            <FormField label="Product Nature">
              <select
                className="input-base"
                value={form.productNature}
                onChange={(e) => setForm({ ...form, productNature: e.target.value })}
              >
                {PRODUCT_NATURES.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
              </select>
            </FormField>

            <FormField label="Stage">
              <select
                className="input-base"
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
              >
                {BUSINESS_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </FormField>
          </div>
        </div>

        {/* Section 2: Scoring & Priority */}
        <div className="bg-white rounded-xl border p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 pb-2 border-b">Scoring & Priority</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label={`Opportunity Score: ${form.score}/100`}>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.score}
                  onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0 — Low</span>
                  <span>50 — Medium</span>
                  <span>100 — High</span>
                </div>
              </div>
            </FormField>

            <FormField label="Priority">
              <div className="grid grid-cols-2 gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p.value })}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      form.priority === p.value ? p.color + ' border-current' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </FormField>
          </div>
        </div>

        {/* Section 3: Market & Customer */}
        <div className="bg-white rounded-xl border p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 pb-2 border-b">Market & Customer</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Target Customer">
              <input
                className="input-base"
                value={form.targetCustomer}
                onChange={(e) => setForm({ ...form, targetCustomer: e.target.value })}
                placeholder="e.g. Indian Army, Apollo Hospitals"
              />
            </FormField>
            <FormField label="Target Market">
              <input
                className="input-base"
                value={form.targetMarket}
                onChange={(e) => setForm({ ...form, targetMarket: e.target.value })}
                placeholder="e.g. India Defence Sector"
              />
            </FormField>
            <FormField label="Estimated Value">
              <div className="flex gap-2">
                <select
                  className="input-base w-24 flex-shrink-0"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
                <input
                  type="number"
                  className="input-base flex-1"
                  value={form.estimatedValue}
                  onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })}
                  placeholder="e.g. 1500000"
                />
              </div>
            </FormField>
          </div>
        </div>

        {/* Section 4: Timeline */}
        <div className="bg-white rounded-xl border p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 pb-2 border-b">Timeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Start Date">
              <input
                type="date"
                className="input-base"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </FormField>
            <FormField label="Target Date">
              <input
                type="date"
                className="input-base"
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
              />
            </FormField>
          </div>
        </div>

        {/* Section 5: Notes & Tags */}
        <div className="bg-white rounded-xl border p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 pb-2 border-b">Notes & Tags</h2>
          <FormField label="Notes">
            <textarea
              className="input-base"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional notes, observations, context..."
            />
          </FormField>
          <FormField label="Tags (comma-separated)">
            <input
              className="input-base"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="e.g. strategic, defence, priority"
            />
          </FormField>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-8">
          <Link href="/businesses" className="px-5 py-2.5 border rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || !form.name}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Creating...' : 'Create Business'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewBusinessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>}>
      <NewBusinessContent />
    </Suspense>
  );
}
