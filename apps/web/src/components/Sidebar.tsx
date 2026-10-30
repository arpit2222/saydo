'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FolderKanban, 
  Users, 
  BookOpen, 
  History, 
  ShieldCheck, 
  Sparkles,
  ExternalLink 
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Applications', href: '/applications', icon: Users },
    { name: 'Documentation', href: '/docs', icon: BookOpen },
    { name: 'Changelog', href: '/changelog', icon: History },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0d121f] flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link href="/projects" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-lg shadow-md shadow-cyan-500/20">
              DX
            </div>
            <div>
              <div className="font-bold text-white tracking-wide text-sm flex items-center gap-1.5">
                DEHIX-lite
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Web3 Talent Network</p>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 flex flex-col gap-1.5">
          <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Platform Demo
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/projects' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info / SayDo Integration Badge */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/30 flex flex-col gap-3">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              SayDo Enabled
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              v1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Record tasks by voice or use the SayDo agent widget to automate workflows.
          </p>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>App ID: <code className="text-slate-400">pk_demo_dehix</code></span>
          <Link href="/" className="hover:text-slate-300 flex items-center gap-1">
            Studio <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
