'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import {
  getSector, getStage, getPriority, getProjectStatus, getSentiment,
  formatCategoryLabel, scoreColor, scoreBg, PRODUCT_NATURES,
} from '@/lib/sector-config';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import {
  ArrowLeft, Edit, Plus, Trash2, Building2, FolderKanban, MessageSquare,
  Calendar, Activity, ExternalLink, Loader2, Star, ChevronDown, ChevronRight,
  Paperclip, FileText, Image, File, Download,
} from 'lucide-react';

type Tab = 'overview' | 'sub-businesses' | 'projects' | 'feedback' | 'milestones' | 'attachments' | 'activity';

function ScoreMeter({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${scoreBg(score)}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-lg font-bold ${scoreColor(score)}`}>{score}/100</span>
    </div>
  );
}

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

export default function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const [attachments, setAttachments] = useState<any[]>([]);

  // New project form state
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  const [projectForm, setProjectForm] = useState({
    name: '', description: '', type: 'PRODUCT', productNature: 'ELECTRONIC',
    status: 'CONCEPT', score: 50, progress: 0, customer: '', budget: '',
  });
  const [feedbackForm, setFeedbackForm] = useState({
    customerName: '', customerOrg: '', sentiment: 'POSITIVE', rating: 4, feedback: '',
  });
  const [milestoneForm, setMilestoneForm] = useState({
    title: '', description: '', dueDate: '',
  });

  useEffect(() => {
    loadBusiness();
  }, [id]);

  async function loadBusiness() {
    setLoading(true);
    try {
      const [bizRes, attRes] = await Promise.all([
        api.get(`/businesses/${id}`),
        api.get(`/attachments/${id}`),
      ]);
      setBusiness(bizRes.data);
      setAttachments(attRes.data);
    } catch {
      router.push('/businesses');
    } finally {
      setLoading(false);
    }
  }

  async function deleteBusiness() {
    if (!confirm(`Delete "${business?.name}"? This will also delete all sub-businesses and projects.`)) return;
    await api.delete(`/businesses/${id}`);
    router.push('/businesses');
  }

  async function addProject() {
    await api.post('/projects', {
      ...projectForm,
      businessId: id,
      score: Number(projectForm.score),
      progress: Number(projectForm.progress),
      budget: projectForm.budget ? Number(projectForm.budget) : null,
    });
    setShowProjectForm(false);
    setProjectForm({ name: '', description: '', type: 'PRODUCT', productNature: 'ELECTRONIC', status: 'CONCEPT', score: 50, progress: 0, customer: '', budget: '' });
    loadBusiness();
  }

  async function addFeedback() {
    await api.post('/feedback', { ...feedbackForm, businessId: id, rating: Number(feedbackForm.rating) });
    setShowFeedbackForm(false);
    setFeedbackForm({ customerName: '', customerOrg: '', sentiment: 'POSITIVE', rating: 4, feedback: '' });
    loadBusiness();
  }

  async function addMilestone() {
    await api.post('/milestones', { ...milestoneForm, businessId: id });
    setShowMilestoneForm(false);
    setMilestoneForm({ title: '', description: '', dueDate: '' });
    loadBusiness();
  }

  async function completeMilestone(milestoneId: string) {
    await api.patch(`/milestones/${milestoneId}`, { status: 'COMPLETED' });
    loadBusiness();
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  if (!business) return null;

  const sec = getSector(business.sector);
  const stg = getStage(business.stage);
  const pri = getPriority(business.priority);
  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'sub-businesses', label: 'Sub-Businesses', count: business.children?.length },
    { key: 'projects', label: 'Projects', count: business.projects?.length },
    { key: 'feedback', label: 'Customer Feedback', count: business.feedbacks?.length },
    { key: 'milestones', label: 'Milestones', count: business.milestones?.length },
    { key: 'attachments', label: 'Attachments', count: attachments?.length },
    { key: 'activity', label: 'Activity Log', count: business.activities?.length },
  ];

  return (
    <div className="space-y-5">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          {business.parent && (
            <Link href={`/businesses/${business.parent.id}`} className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
              <ExternalLink className="w-3 h-3" /> Parent: {business.parent.name}
            </Link>
          )}
          <Link
            href={`/businesses/new?parentId=${id}&sector=${business.sector}`}
            className="flex items-center gap-1.5 px-3 py-1.5 border text-sm rounded-lg hover:bg-gray-50 text-gray-700"
          >
            <Plus className="w-3.5 h-3.5" /> Sub-Business
          </Link>
          <Link
            href={`/businesses/${id}/edit`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
          >
            <Edit className="w-3.5 h-3.5" /> Edit
          </Link>
          <button
            onClick={deleteBusiness}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-start gap-5">
          <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-3xl flex-shrink-0 ${sec?.bg ?? 'bg-gray-50'}`}>
            {sec?.icon ?? '📁'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
              {business.parentId && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Sub-business</span>}
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${sec?.color ?? ''}`}>{sec?.label}</span>
              <span className="text-gray-300">·</span>
              <span className="text-sm text-gray-600">{formatCategoryLabel(business.category)}</span>
              <span className="text-gray-300">·</span>
              <span className="text-sm text-gray-600">{business.productNature?.replace(/_/g, ' ')}</span>
            </div>
            {business.description && (
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{business.description}</p>
            )}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${stg?.color}`}>{stg?.label}</span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${pri?.color}`}>{pri?.label} Priority</span>
              {business.targetCustomer && (
                <span className="text-xs text-gray-500">Customer: {business.targetCustomer}</span>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0 space-y-2 min-w-[160px]">
            <div>
              <p className="text-xs text-gray-400 mb-1">Opportunity Score</p>
              <ScoreMeter score={business.score} />
            </div>
            {business.estimatedValue && (
              <div>
                <p className="text-xs text-gray-400">Est. Value</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(business.estimatedValue, business.currency)}</p>
              </div>
            )}
            {business.targetDate && (
              <div>
                <p className="text-xs text-gray-400">Target Date</p>
                <p className="text-sm font-medium text-gray-700">{formatDate(business.targetDate)}</p>
              </div>
            )}
          </div>
        </div>

        {business.tags?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-4 pt-4 border-t">
            {business.tags.map((tag: string) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border p-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === t.key ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === t.key ? 'bg-indigo-500 text-indigo-100' : 'bg-gray-100 text-gray-600'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border p-5 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Business Details</h3>
            <div className="space-y-3 text-sm">
              <Row label="Sector" value={`${sec?.icon} ${sec?.label}`} />
              <Row label="Category" value={formatCategoryLabel(business.category)} />
              <Row label="Product Nature" value={business.productNature?.replace(/_/g, ' ')} />
              <Row label="Stage" value={<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stg?.color}`}>{stg?.label}</span>} />
              <Row label="Priority" value={<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pri?.color}`}>{pri?.label}</span>} />
              {business.targetCustomer && <Row label="Target Customer" value={business.targetCustomer} />}
              {business.targetMarket && <Row label="Target Market" value={business.targetMarket} />}
              {business.estimatedValue && <Row label="Est. Value" value={formatCurrency(business.estimatedValue, business.currency)} />}
              {business.startDate && <Row label="Start Date" value={formatDate(business.startDate)} />}
              {business.targetDate && <Row label="Target Date" value={formatDate(business.targetDate)} />}
              {business.owner && <Row label="Owner" value={business.owner.name} />}
            </div>
          </div>

          <div className="space-y-5">
            {/* Quick counts */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Sub-Businesses', value: business.children?.length ?? 0, icon: Building2, href: '#', tab: 'sub-businesses' as Tab },
                { label: 'Projects', value: business.projects?.length ?? 0, icon: FolderKanban, href: '#', tab: 'projects' as Tab },
                { label: 'Feedback', value: business.feedbacks?.length ?? 0, icon: MessageSquare, href: '#', tab: 'feedback' as Tab },
              ].map((c) => (
                <button
                  key={c.label}
                  onClick={() => setActiveTab(c.tab)}
                  className="bg-white rounded-xl border p-4 text-center hover:border-indigo-300 transition-colors"
                >
                  <c.icon className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-900">{c.value}</p>
                  <p className="text-xs text-gray-500">{c.label}</p>
                </button>
              ))}
            </div>

            {/* Upcoming milestones quick view */}
            {business.milestones?.length > 0 && (
              <div className="bg-white rounded-xl border p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Upcoming Milestones</h3>
                <div className="space-y-2">
                  {business.milestones.slice(0, 4).map((m: any) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        m.status === 'COMPLETED' ? 'bg-emerald-500' :
                        m.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                        m.status === 'MISSED' ? 'bg-red-500' : 'bg-gray-300'
                      }`} />
                      <p className="text-xs text-gray-700 flex-1">{m.title}</p>
                      <p className="text-xs text-gray-400">{formatDate(m.dueDate)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {business.notes && (
              <div className="bg-white rounded-xl border p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{business.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SUB-BUSINESSES TAB ───────────────────────────────────────────── */}
      {activeTab === 'sub-businesses' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Link
              href={`/businesses/new?parentId=${id}&sector=${business.sector}`}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> Add Sub-Business
            </Link>
          </div>

          {business.children?.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-500">No sub-businesses yet</p>
              <p className="text-sm text-gray-400 mt-1">Break this business into specific products, solutions, or segments</p>
            </div>
          ) : (
            business.children.map((child: any) => {
              const cs = getSector(child.sector);
              const cst = getStage(child.stage);
              return (
                <Link key={child.id} href={`/businesses/${child.id}`} className="block bg-white rounded-xl border hover:border-indigo-300 hover:shadow-sm transition-all p-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-2xl flex-shrink-0 ${cs?.bg ?? 'bg-gray-50'}`}>
                      {cs?.icon ?? '📁'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{child.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${cst?.color}`}>{cst?.label}</span>
                        <span className="text-xs text-gray-500">{formatCategoryLabel(child.category)}</span>
                        {child._count?.projects > 0 && <span className="text-xs text-gray-400">{child._count.projects} projects</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full ${scoreBg(child.score)}`} style={{ width: `${child.score}%` }} />
                        </div>
                        <span className={`text-sm font-bold ${scoreColor(child.score)}`}>{child.score}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}

      {/* ── PROJECTS TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'projects' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => setShowProjectForm(!showProjectForm)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> Add Project / Product
            </button>
          </div>

          {/* Project form */}
          {showProjectForm && (
            <div className="bg-white rounded-xl border p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">New Project / Product / Solution</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Name *">
                  <input className="input-base" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} placeholder="e.g. Radar Signal Processor" />
                </FormField>
                <FormField label="Type">
                  <select className="input-base" value={projectForm.type} onChange={(e) => setProjectForm({ ...projectForm, type: e.target.value })}>
                    {['PROJECT', 'PROGRAM', 'PRODUCT', 'SOLUTION', 'POC', 'PILOT'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormField>
                <FormField label="Product Nature">
                  <select className="input-base" value={projectForm.productNature} onChange={(e) => setProjectForm({ ...projectForm, productNature: e.target.value })}>
                    {PRODUCT_NATURES.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
                  </select>
                </FormField>
                <FormField label="Status">
                  <select className="input-base" value={projectForm.status} onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}>
                    {['CONCEPT', 'PROPOSAL', 'DEVELOPMENT', 'TESTING', 'DEPLOYED', 'ON_HOLD', 'CANCELLED'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FormField>
                <FormField label="Score (0-100)">
                  <input type="number" min="0" max="100" className="input-base" value={projectForm.score} onChange={(e) => setProjectForm({ ...projectForm, score: Number(e.target.value) })} />
                </FormField>
                <FormField label="Progress (%)">
                  <input type="number" min="0" max="100" className="input-base" value={projectForm.progress} onChange={(e) => setProjectForm({ ...projectForm, progress: Number(e.target.value) })} />
                </FormField>
                <FormField label="Customer">
                  <input className="input-base" value={projectForm.customer} onChange={(e) => setProjectForm({ ...projectForm, customer: e.target.value })} placeholder="Customer name" />
                </FormField>
                <FormField label="Budget (USD)">
                  <input type="number" className="input-base" value={projectForm.budget} onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })} placeholder="e.g. 500000" />
                </FormField>
              </div>
              <FormField label="Description">
                <textarea className="input-base" rows={2} value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} />
              </FormField>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowProjectForm(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600">Cancel</button>
                <button onClick={addProject} disabled={!projectForm.name} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm disabled:opacity-50">Add Project</button>
              </div>
            </div>
          )}

          {business.projects?.length === 0 && !showProjectForm ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <FolderKanban className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-500">No projects yet</p>
            </div>
          ) : (
            business.projects.map((p: any) => {
              const pst = getProjectStatus(p.status);
              return (
                <Link key={p.id} href={`/projects/${p.id}`} className="block bg-white rounded-xl border hover:border-indigo-300 transition-all p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{p.name}</p>
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{p.type}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${pst?.color}`}>{pst?.label}</span>
                        <span className="text-xs text-gray-500">{p.productNature?.replace(/_/g, ' ')}</span>
                        {p.customer && <span className="text-xs text-gray-400">· {p.customer}</span>}
                      </div>
                      {p.description && <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">{p.description}</p>}
                      <div className="mt-2">
                        <ProgressBar progress={p.progress} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="w-14 bg-gray-100 rounded-full h-1.5">
                          <div className={`h-full rounded-full ${scoreBg(p.score)}`} style={{ width: `${p.score}%` }} />
                        </div>
                        <span className={`text-sm font-bold ${scoreColor(p.score)}`}>{p.score}</span>
                      </div>
                      {p.budget && <p className="text-xs text-gray-400 mt-1">{formatCurrency(p.budget)}</p>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 self-center flex-shrink-0" />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}

      {/* ── FEEDBACK TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'feedback' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> Add Feedback
            </button>
          </div>

          {showFeedbackForm && (
            <div className="bg-white rounded-xl border p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Customer Feedback</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Customer Name *">
                  <input className="input-base" value={feedbackForm.customerName} onChange={(e) => setFeedbackForm({ ...feedbackForm, customerName: e.target.value })} />
                </FormField>
                <FormField label="Organization">
                  <input className="input-base" value={feedbackForm.customerOrg} onChange={(e) => setFeedbackForm({ ...feedbackForm, customerOrg: e.target.value })} />
                </FormField>
                <FormField label="Sentiment">
                  <select className="input-base" value={feedbackForm.sentiment} onChange={(e) => setFeedbackForm({ ...feedbackForm, sentiment: e.target.value })}>
                    {['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'REQUIREMENT'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FormField>
                <FormField label="Rating (1-5)">
                  <input type="number" min="1" max="5" className="input-base" value={feedbackForm.rating} onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: Number(e.target.value) })} />
                </FormField>
              </div>
              <FormField label="Feedback *">
                <textarea className="input-base" rows={3} value={feedbackForm.feedback} onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })} />
              </FormField>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowFeedbackForm(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600">Cancel</button>
                <button onClick={addFeedback} disabled={!feedbackForm.customerName || !feedbackForm.feedback} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm disabled:opacity-50">Save Feedback</button>
              </div>
            </div>
          )}

          {business.feedbacks?.length === 0 && !showFeedbackForm ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-500">No customer feedback yet</p>
            </div>
          ) : (
            business.feedbacks.map((f: any) => {
              const sent = getSentiment(f.sentiment);
              return (
                <div key={f.id} className="bg-white rounded-xl border p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{sent?.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{f.customerName}</p>
                        {f.customerOrg && <p className="text-xs text-gray-500">{f.customerOrg}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sent?.color}`}>{sent?.label}</span>
                          {f.rating && (
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < f.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 flex-shrink-0">{formatDate(f.date)}</p>
                  </div>
                  <p className="text-sm text-gray-700 mt-3 leading-relaxed">{f.feedback}</p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── MILESTONES TAB ───────────────────────────────────────────────── */}
      {activeTab === 'milestones' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => setShowMilestoneForm(!showMilestoneForm)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> Add Milestone
            </button>
          </div>

          {showMilestoneForm && (
            <div className="bg-white rounded-xl border p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">New Milestone</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Title *">
                  <input className="input-base" value={milestoneForm.title} onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })} />
                </FormField>
                <FormField label="Due Date *">
                  <input type="date" className="input-base" value={milestoneForm.dueDate} onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })} />
                </FormField>
              </div>
              <FormField label="Description">
                <textarea className="input-base" rows={2} value={milestoneForm.description} onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })} />
              </FormField>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowMilestoneForm(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600">Cancel</button>
                <button onClick={addMilestone} disabled={!milestoneForm.title || !milestoneForm.dueDate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm disabled:opacity-50">Add Milestone</button>
              </div>
            </div>
          )}

          {business.milestones?.length === 0 && !showMilestoneForm ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-500">No milestones set</p>
            </div>
          ) : (
            business.milestones.map((m: any) => (
              <div key={m.id} className="bg-white rounded-xl border p-4 flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                  m.status === 'COMPLETED' ? 'bg-emerald-500' :
                  m.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                  m.status === 'MISSED' ? 'bg-red-500' : 'bg-gray-300'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{m.title}</p>
                  {m.description && <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">Due: {formatDate(m.dueDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    m.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                    m.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                    m.status === 'MISSED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  }`}>{m.status.replace('_', ' ')}</span>
                  {m.status !== 'COMPLETED' && (
                    <button onClick={() => completeMilestone(m.id)} className="text-xs text-emerald-600 hover:underline">Mark done</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── ATTACHMENTS TAB ──────────────────────────────────────────────── */}
      {activeTab === 'attachments' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Link
              href={`/businesses/${id}/edit`}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> Upload Files
            </Link>
          </div>

          {attachments.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <Paperclip className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-500">No attachments yet</p>
              <p className="text-sm text-gray-400 mt-1">Go to edit page to upload files</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {attachments.map((att: any) => {
                const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
                const isImage = att.mimeType?.startsWith('image/');
                return (
                  <div key={att.id} className="bg-white rounded-xl border p-4 hover:border-indigo-200 transition-colors">
                    <div className="flex items-start gap-3">
                      {isImage ? (
                        <img
                          src={`${apiBase}/uploads/${att.filename}`}
                          alt={att.originalName}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                          {att.mimeType?.includes('pdf') ? <FileText className="w-6 h-6 text-red-500" /> : <File className="w-6 h-6 text-gray-400" />}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <a
                          href={`${apiBase}/uploads/${att.filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-indigo-600 hover:underline truncate block"
                        >
                          {att.originalName}
                        </a>
                        {att.description && <p className="text-xs text-gray-500 mt-0.5">{att.description}</p>}
                        <p className="text-xs text-gray-400 mt-1">
                          {att.size < 1024 * 1024 ? (att.size / 1024).toFixed(1) + ' KB' : (att.size / (1024 * 1024)).toFixed(1) + ' MB'}
                          {' · '}
                          {new Date(att.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <a
                        href={`${apiBase}/uploads/${att.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-indigo-600"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ACTIVITY TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Activity Log</h3>
          {business.activities?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No activity recorded</p>
          ) : (
            <div className="space-y-4">
              {business.activities.map((a: any) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                    {a.user?.name ? a.user.name[0] : '?'}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">{a.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.user?.name} · {formatDateTime(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper components
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-gray-900 font-medium text-right">{value}</span>
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
