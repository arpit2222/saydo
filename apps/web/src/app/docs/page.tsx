import React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { BookOpen, FolderKanban, Users, ShieldAlert, FileText, ArrowRight } from 'lucide-react';

export default function DocsLandingPage() {
  const sections = [
    {
      title: 'Project Rules & Budget Guidelines',
      href: '/docs/projects',
      icon: FolderKanban,
      description: 'Requirements for creating projects, budget minimums (₹10,000) and ceilings (₹10,00,000 INR).',
      badge: 'Core Rule',
    },
    {
      title: 'Team Roles & Member Invites',
      href: '/docs/members',
      icon: Users,
      description: 'Role permissions (viewer, editor, admin) and the critical rule: only active admins can invite admins.',
      badge: 'Security Rule',
    },
    {
      title: 'Application Evaluation & Decisions',
      href: '/docs/applications',
      icon: ShieldAlert,
      description: 'Decision workflow for grant candidates, including the terminal rule: rejected applications cannot be reopened.',
      badge: 'Workflow Rule',
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#080c14] text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Platform Documentation" />

        <main className="p-8 max-w-5xl w-full mx-auto flex flex-col gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              DEHIX System Rules & API Docs
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Platform Guidelines</h2>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-2xl">
              These official rules govern project budgets, team role assignments, and application decisions across the DEHIX network.
              SayDo's Tavily Discover and Ask Docs features ground themselves directly on these pages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sections.map((sec) => {
              const Icon = sec.icon;
              return (
                <Link
                  key={sec.href}
                  href={sec.href}
                  className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between group shadow-lg"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                        {sec.badge}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                      {sec.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {sec.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                    <span>Read policy documentation</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Tavily Integration Callout */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/40 to-cyan-950/40 border border-blue-800/40 flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Grounded AI Verification
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              When SayDo's autonomous agent answers user queries or validates natural language task sequences, Tavily parses these exact docs pages to synthesize verified policy limits.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
