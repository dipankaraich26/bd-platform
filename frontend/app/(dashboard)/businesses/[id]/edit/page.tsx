'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import {
  SECTORS, SECTOR_CATEGORIES, BUSINESS_STAGES, PRODUCT_NATURES, PRIORITIES,
  formatCategoryLabel, Sector,
} from '@/lib/sector-config';
import { ArrowLeft, Loader2, Upload, X, FileText, Image, File, Trash2, Paperclip } from 'lucide-react';

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

interface AttachmentFile {
  file: File;
  description: string;
  preview?: string;
}

interface ExistingAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  description: string | null;
  createdAt: string;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
  if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
  return <File className="w-5 h-5 text-gray-500" />;
}

export default function EditBusinessPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(null);

  // Attachment state
  const [newFiles, setNewFiles] = useState<AttachmentFile[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<ExistingAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      api.get(`/businesses/${id}`),
      api.get(`/attachments/${id}`),
    ]).then(([bizRes, attRes]) => {
      const b = bizRes.data;
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
      setExistingAttachments(attRes.data);
    }).finally(() => setLoading(false));
  }, [id]);

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map((file) => ({
      file,
      description: '',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));
    setNewFiles((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => {
      const updated = [...prev];
      if (updated[index].preview) URL.revokeObjectURL(updated[index].preview!);
      updated.splice(index, 1);
      return updated;
    });
  }

  function updateFileDescription(index: number, description: string) {
    setNewFiles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], description };
      return updated;
    });
  }

  async function deleteExistingAttachment(attId: string) {
    if (!confirm('Delete this attachment?')) return;
    await api.delete(`/attachments/item/${attId}`);
    setExistingAttachments((prev) => prev.filter((a) => a.id !== attId));
  }

  async function uploadAttachments() {
    if (newFiles.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      newFiles.forEach((f) => formData.append('files', f.file));
      formData.append('descriptions', JSON.stringify(newFiles.map((f) => f.description)));

      const token = localStorage.getItem('bd_token');
      const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${baseURL}/attachments/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const uploaded = await res.json();
      setExistingAttachments((prev) => [...uploaded, ...prev]);
      newFiles.forEach((f) => { if (f.preview) URL.revokeObjectURL(f.preview); });
      setNewFiles([]);
    } catch (err) {
      alert('Failed to upload attachments');
    } finally {
      setUploading(false);
    }
  }

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

        {/* Attachments Section */}
        <div className="bg-white rounded-xl border p-6 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Paperclip className="w-4 h-4" /> Attachments
            </h2>
            <span className="text-xs text-gray-500">{existingAttachments.length} file(s)</span>
          </div>

          {/* Existing Attachments */}
          {existingAttachments.length > 0 && (
            <div className="space-y-2">
              {existingAttachments.map((att) => {
                const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
                return (
                  <div key={att.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">
                    {getFileIcon(att.mimeType)}
                    <div className="flex-1 min-w-0">
                      <a
                        href={`${apiBase}/uploads/${att.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-indigo-600 hover:underline truncate block"
                      >
                        {att.originalName}
                      </a>
                      {att.description && <p className="text-xs text-gray-500 truncate">{att.description}</p>}
                      <p className="text-xs text-gray-400">{formatFileSize(att.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteExistingAttachment(att.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* New Files to Upload */}
          {newFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">New files to upload</h3>
              {newFiles.map((f, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  {f.preview ? (
                    <img src={f.preview} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-white flex items-center justify-center flex-shrink-0">
                      {getFileIcon(f.file.type)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">{f.file.name}</p>
                      <button type="button" onClick={() => removeNewFile(idx)} className="p-1 text-gray-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">{formatFileSize(f.file.size)}</p>
                    <input
                      type="text"
                      placeholder="Add description (optional)"
                      value={f.description}
                      onChange={(e) => updateFileDescription(idx, e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={uploadAttachments}
                disabled={uploading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Uploading...' : `Upload ${newFiles.length} file(s)`}
              </button>
            </div>
          )}

          {/* File picker */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
          >
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Click to select files</p>
            <p className="text-xs text-gray-400 mt-1">PDF, images, documents up to 25MB each. Multiple files supported.</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
          </div>
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
