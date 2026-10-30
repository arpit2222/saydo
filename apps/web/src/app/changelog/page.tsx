import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { History, Tag, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';

export default function ChangelogPage() {
  const changelog = [
    {
      date: '2026-10-28',
      version: 'v1.4.2',
      tag: 'Upcoming Schema Notice',
      title: 'Budget parameter schema migration notice',
      type: 'warning',
      description:
        'In the forthcoming v2.0 API release, the project creation field "budget" will be standardized to "amount" across all microservices. All client integrations and autonomous agent skills should prepare for this schema transition.',
      affectedSkills: ['create_project'],
    },
    {
      date: '2026-10-20',
      version: 'v1.4.0',
      tag: 'Policy Enforcement',
      title: 'Enforced monetary ceilings on project grants (₹10,000 to ₹10,00,000 INR)',
      type: 'feature',
      description:
        'Implemented strict API-level validation: any project creation with a budget lower than ₹10,000 or exceeding ₹10,00,000 INR will be blocked with a 400 Bad Request.',
      affectedSkills: ['create_project'],
    },
    {
      date: '2026-10-12',
      version: 'v1.3.1',
      tag: 'Security Patch',
      title: 'Strict RBAC for administrator invitations',
      type: 'security',
      description:
        'Restricted the invite_member endpoint to ensure non-admin users and autonomous agent loops cannot assign the "admin" role without explicit administrator authorization.',
      affectedSkills: ['invite_member'],
    },
    {
      date: '2026-09-30',
      version: 'v1.2.0',
      tag: 'Workflow Rule',
      title: 'Terminal status for rejected talent applications',
      type: 'feature',
      description:
        'Updated application state machine so that applications marked as "rejected" cannot be modified or reopened.',
      affectedSkills: ['update_application_decision'],
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#080c14] text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Changelog & Release Feed" />

        <main className="p-8 max-w-4xl w-full mx-auto flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2">
              <History className="w-4 h-4" />
              <span>PLATFORM CHANGELOG</span>
            </div>
            <h1 className="text-3xl font-bold text-white">DEHIX Release Notes</h1>
            <p className="text-sm text-slate-400 mt-2">
              All platform API and policy updates are published here. SayDo Tavily Drift Watch scans this page to flag skills at risk of drift.
            </p>
          </div>

          {/* Timeline Feed */}
          <div className="flex flex-col gap-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {changelog.map((entry, idx) => (
              <div key={idx} className="flex items-start gap-6 pl-1 relative">
                <div className="w-5 h-5 rounded-full bg-[#080c14] border-2 border-cyan-400 flex items-center justify-center shrink-0 z-10 mt-1">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                </div>

                <div className="flex-1 p-6 rounded-2xl bg-[#0d121f] border border-slate-800 hover:border-slate-700 transition-colors flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                        {entry.version}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {entry.date}
                      </span>
                    </div>

                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${
                      entry.type === 'warning'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : entry.type === 'security'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {entry.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{entry.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {entry.description}
                  </p>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-500">
                    <span>Targeted Skills:</span>
                    {entry.affectedSkills.map((sk) => (
                      <code key={sk} className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        {sk}
                      </code>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
