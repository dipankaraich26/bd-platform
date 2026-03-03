'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { getSector, getProjectStatus, getSentiment, PRODUCT_NATURES, scoreColor, scoreBg } from '@/lib/sector-config';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { ArrowLeft, Loader2, Star, Plus, Calendar } from 'lucide-react';

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
      </div>
      <span className="text-xs text-gray-600 font-medium w-8">{progress}%</span>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ customerName: '', customerOrg: '', sentiment: 'POSITIVE', rating: 4, feedback: '' });
  const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '', dueDate: '' });

  useEffect(() => { loadProject(); }, [id]);

  async function loadProject() {
    setLoading(true);
    try {
      const r = await api.get(`/projects/${id}`);
      setProject(r.data);
      setEditForm({
        name: r.data.name,
        status: r.data.status,
        progress: r.data.progress,
        score: r.data.score,
        customer: r.data.customer || '',
        customerContact: r.data.customerContact || '',
        notes: r.data.notes || '',
      });
    } catch { router.push('/projects'); }
    finally { setLoading(false); }
  }

  async function saveEdit() {
    await api.patch(`/projects/${id}`, { ...editForm, progress: Number(editForm.progress), score: Number(editForm.score) });
    setEditing(false);
    loadProject();
  }

  async function addFeedback() {
    await api.post('/feedback', { ...feedbackForm, projectId: id, rating: Number(feedbackForm.rating) });
    setShowFeedbackForm(false);
    setFeedbackForm({ customerName: '', customerOrg: '', sentiment: 'POSITIVE', rating: 4, feedback: '' });
    loadProject();
  }

  async function addMilestone() {
    await api.post('/milestones', { ...milestoneForm, projectId: id });
    setShowMilestoneForm(false);
    setMilestoneForm({ title: '', description: '', dueDate: '' });
    loadProject();
  }

  async function completeMilestone(milestoneId: string) {
    await api.patch(`/milestones/${milestoneId}`, { status: 'COMPLETED' });
    loadProject();
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  if (!project) return null;

  const pst = getProjectStatus(project.status);
  const sec = getSector(project.business?.sector);

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="px-4 py-1.5 border rounded-lg text-sm text-gray-700 hover:bg-gray-50">Edit</button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="px-4 py-1.5 border rounded-lg text-sm text-gray-600">Cancel</button>
            <button onClick={saveEdit} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm">Save</button>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-3xl ${sec?.bg ?? 'bg-gray-50'}`}>
            {sec?.icon ?? '📁'}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <input className="input-base text-xl font-bold" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            )}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{project.type}</span>
              {editing ? (
                <select className="input-base text-xs w-40" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                  {['CONCEPT','PROPOSAL','DEVELOPMENT','TESTING','DEPLOYED','ON_HOLD','CANCELLED'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pst?.color}`}>{pst?.label}</span>
              )}
              {project.business && (
                <Link href={`/businesses/${project.business.id}`} className="text-xs text-indigo-600 hover:underline">
                  {project.business.name}
                </Link>
              )}
            </div>
            {project.description && <p className="text-sm text-gray-600 mt-2">{project.description}</p>}
          </div>
          <div className="text-right flex-shrink-0 min-w-[150px]">
            <p className="text-xs text-gray-400 mb-1">Score</p>
            {editing ? (
              <input type="number" min="0" max="100" className="input-base w-20 text-right" value={editForm.score} onChange={(e) => setEditForm({ ...editForm, score: e.target.value })} />
            ) : (
              <div className="flex items-center gap-2 justify-end">
                <div className="w-16 bg-gray-100 rounded-full h-2">
                  <div className={`h-full rounded-full ${scoreBg(project.score)}`} style={{ width: `${project.score}%` }} />
                </div>
                <span className={`font-bold ${scoreColor(project.score)}`}>{project.score}/100</span>
              </div>
            )}
            {project.budget && <p className="text-sm font-semibold text-gray-700 mt-2">{formatCurrency(project.budget)}</p>}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-5 pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Progress</p>
            {editing && (
              <input type="number" min="0" max="100" className="input-base w-20 text-right" value={editForm.progress} onChange={(e) => setEditForm({ ...editForm, progress: e.target.value })} />
            )}
          </div>
          <ProgressBar progress={editing ? Number(editForm.progress) : project.progress} />
        </div>

        {/* Customer (editable) */}
        {editing ? (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <FormField label="Customer">
              <input className="input-base" value={editForm.customer} onChange={(e) => setEditForm({ ...editForm, customer: e.target.value })} />
            </FormField>
            <FormField label="Customer Contact">
              <input className="input-base" value={editForm.customerContact} onChange={(e) => setEditForm({ ...editForm, customerContact: e.target.value })} />
            </FormField>
          </div>
        ) : (
          project.customer && (
            <div className="flex gap-4 mt-4 text-sm">
              <div><span className="text-gray-500">Customer: </span><span className="font-medium">{project.customer}</span></div>
              {project.customerContact && <div><span className="text-gray-500">Contact: </span><span className="font-medium">{project.customerContact}</span></div>}
            </div>
          )
        )}

        {/* Notes */}
        {editing ? (
          <div className="mt-4">
            <FormField label="Notes">
              <textarea className="input-base" rows={3} value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
            </FormField>
          </div>
        ) : project.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 whitespace-pre-line">{project.notes}</div>
        )}

        {/* Meta info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-4 border-t text-sm">
          {project.startDate && <div><p className="text-xs text-gray-400">Start</p><p className="font-medium">{formatDate(project.startDate)}</p></div>}
          {project.endDate && <div><p className="text-xs text-gray-400">End / Due</p><p className="font-medium">{formatDate(project.endDate)}</p></div>}
          {project.productNature && <div><p className="text-xs text-gray-400">Nature</p><p className="font-medium">{project.productNature.replace(/_/g, ' ')}</p></div>}
          {project.budget && <div><p className="text-xs text-gray-400">Budget</p><p className="font-medium">{formatCurrency(project.budget)}</p></div>}
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-xl border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Milestones</h2>
          <button onClick={() => setShowMilestoneForm(!showMilestoneForm)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        {showMilestoneForm && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Title *"><input className="input-base" value={milestoneForm.title} onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })} /></FormField>
              <FormField label="Due Date *"><input type="date" className="input-base" value={milestoneForm.dueDate} onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })} /></FormField>
            </div>
            <FormField label="Description"><input className="input-base" value={milestoneForm.description} onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })} /></FormField>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowMilestoneForm(false)} className="px-3 py-1.5 border rounded-lg text-xs text-gray-600">Cancel</button>
              <button onClick={addMilestone} disabled={!milestoneForm.title || !milestoneForm.dueDate} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs disabled:opacity-50">Add</button>
            </div>
          </div>
        )}
        {project.milestones?.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No milestones yet</p>}
        {project.milestones?.map((m: any) => (
          <div key={m.id} className="flex items-start gap-3 py-2 border-b last:border-0">
            <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${m.status === 'COMPLETED' ? 'bg-emerald-500' : m.status === 'IN_PROGRESS' ? 'bg-blue-500' : m.status === 'MISSED' ? 'bg-red-500' : 'bg-gray-300'}`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{m.title}</p>
              <p className="text-xs text-gray-400">Due: {formatDate(m.dueDate)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${m.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{m.status.replace('_', ' ')}</span>
              {m.status !== 'COMPLETED' && <button onClick={() => completeMilestone(m.id)} className="text-xs text-emerald-600 hover:underline">Done</button>}
            </div>
          </div>
        ))}
      </div>

      {/* Feedback */}
      <div className="bg-white rounded-xl border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Customer Feedback</h2>
          <button onClick={() => setShowFeedbackForm(!showFeedbackForm)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg">
            <Plus className="w-3 h-3" /> Add Feedback
          </button>
        </div>
        {showFeedbackForm && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Customer *"><input className="input-base" value={feedbackForm.customerName} onChange={(e) => setFeedbackForm({ ...feedbackForm, customerName: e.target.value })} /></FormField>
              <FormField label="Organization"><input className="input-base" value={feedbackForm.customerOrg} onChange={(e) => setFeedbackForm({ ...feedbackForm, customerOrg: e.target.value })} /></FormField>
              <FormField label="Sentiment">
                <select className="input-base" value={feedbackForm.sentiment} onChange={(e) => setFeedbackForm({ ...feedbackForm, sentiment: e.target.value })}>
                  {['POSITIVE','NEUTRAL','NEGATIVE','REQUIREMENT'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label="Rating (1-5)"><input type="number" min="1" max="5" className="input-base" value={feedbackForm.rating} onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: Number(e.target.value) })} /></FormField>
            </div>
            <FormField label="Feedback *"><textarea className="input-base" rows={2} value={feedbackForm.feedback} onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })} /></FormField>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowFeedbackForm(false)} className="px-3 py-1.5 border rounded-lg text-xs text-gray-600">Cancel</button>
              <button onClick={addFeedback} disabled={!feedbackForm.customerName || !feedbackForm.feedback} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs disabled:opacity-50">Save</button>
            </div>
          </div>
        )}
        {project.feedbacks?.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No feedback yet</p>}
        {project.feedbacks?.map((f: any) => {
          const sent = getSentiment(f.sentiment);
          return (
            <div key={f.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span>{sent?.icon}</span>
                  <p className="text-sm font-medium text-gray-900">{f.customerName}</p>
                  {f.customerOrg && <span className="text-xs text-gray-500">· {f.customerOrg}</span>}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${sent?.color}`}>{sent?.label}</span>
                  {f.rating && (
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < f.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400">{formatDate(f.date)}</p>
              </div>
              <p className="text-sm text-gray-700">{f.feedback}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
