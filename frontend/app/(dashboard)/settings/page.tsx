'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import api from '@/lib/api';
import { Loader2, Check } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await api.patch('/auth/profile', { name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="bg-white rounded-xl border p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Profile</h2>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Display Name</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            value={user?.email || ''}
            readOnly
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <input
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            value={user?.role || ''}
            readOnly
          />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">About BD Platform</h2>
        <div className="text-sm text-gray-600 space-y-2">
          <p>Business Development Portfolio Management System</p>
          <p className="text-gray-400">Manage business ideas, products, projects and solutions across Defence, Medical, Automotive, Climate Control, Electronics and Technology sectors.</p>
        </div>
      </div>
    </div>
  );
}
