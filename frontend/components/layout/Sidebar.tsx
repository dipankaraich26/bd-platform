'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';
import { SECTORS } from '@/lib/sector-config';
import {
  LayoutDashboard, Briefcase, FolderKanban, MessageSquare,
  BarChart3, Settings, LogOut, ChevronDown, TrendingUp
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard',        href: '/',           icon: LayoutDashboard },
  { label: 'Businesses',       href: '/businesses', icon: Briefcase },
  { label: 'Projects',         href: '/projects',   icon: FolderKanban },
  { label: 'Customer Feedback',href: '/feedback',   icon: MessageSquare },
  { label: 'Analytics',        href: '/analytics',  icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [sectorOpen, setSectorOpen] = useState(false);

  function getInitials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-full bg-[hsl(222_47%_11%)] text-white overflow-y-auto">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">BD Platform</p>
          <p className="text-[10px] text-slate-400 leading-tight">Business Development</p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-white/8 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}

        {/* Quick Sector Filter */}
        <div className="pt-3">
          <button
            onClick={() => setSectorOpen(!sectorOpen)}
            className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider"
          >
            <span>By Sector</span>
            <ChevronDown className={cn('w-3 h-3 transition-transform', sectorOpen && 'rotate-180')} />
          </button>
          {sectorOpen && (
            <div className="mt-1 space-y-0.5">
              {SECTORS.map((s) => (
                <Link
                  key={s.value}
                  href={`/businesses?sector=${s.value}`}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors text-slate-400 hover:bg-white/8 hover:text-white'
                  )}
                >
                  <span className="text-base leading-none">{s.icon}</span>
                  {s.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom: settings + user */}
      <div className="border-t border-white/10 px-3 py-3 space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
            pathname === '/settings'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-300 hover:bg-white/8 hover:text-white'
          )}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2 mt-1">
          <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user ? getInitials(user.name) : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1 hover:text-red-400 text-slate-500 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
