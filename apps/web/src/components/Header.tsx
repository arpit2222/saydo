'use client';

import React from 'react';
import { ShieldCheck, Bell, Sparkles } from 'lucide-react';

export function Header({ title = 'DEHIX Platform' }: { title?: string }) {
  return (
    <header className="h-16 border-b border-slate-800 bg-[#0b0f19]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-slate-100">{title}</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
          Devnet
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* SayDo status pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SayDo SDK Active</span>
        </div>

        {/* User Profile Pill: Ash (admin) */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs ring-2 ring-blue-500/30">
              A
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0b0f19] rounded-full"></span>
          </div>
          <div className="flex flex-col">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              Ash
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-medium border border-blue-500/30">
                admin
              </span>
            </div>
            <span className="text-[11px] text-slate-400">ash@dehix.org</span>
          </div>
        </div>
      </div>
    </header>
  );
}
