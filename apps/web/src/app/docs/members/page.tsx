import React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Users, ArrowLeft, ShieldAlert, Key } from 'lucide-react';

export default function MembersDocsPage() {
  return (
    <div className="flex min-h-screen bg-[#080c14] text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Docs / Team Roles & Permissions" />

        <main className="p-8 max-w-4xl w-full mx-auto flex flex-col gap-8">
          <Link
            href="/docs"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Documentation Overview
          </Link>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-2">
              <Users className="w-4 h-4" />
              <span>ACCESS CONTROL SPECIFICATION</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Member Roles & Invitation Policy</h1>
            <p className="text-sm text-slate-400 mt-2">
              Role definitions, invitation hierarchies, and autonomous agent restrictions.
            </p>
          </div>

          {/* Core Security Rule Highlight */}
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-4">
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-rose-300 text-sm">
                Security Constraint: Only Admins Can Invite Admins
              </span>
              <p className="text-xs text-rose-200/80 leading-relaxed">
                Autonomous AI agents and non-admin team members are strictly prohibited from issuing invitations with role="admin".
                Any request containing role="admin" must trigger a policy block or require explicit out-of-band confirmation.
              </p>
            </div>
          </div>

          {/* Role Hierarchy */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-white">Role Privileges</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#0d121f] border border-slate-800 flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-300 uppercase">Viewer</span>
                <p className="text-xs text-slate-400">
                  Read-only access to project milestones, deliverables, and candidate lists.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0d121f] border border-slate-800 flex flex-col gap-2">
                <span className="text-xs font-bold text-blue-400 uppercase">Editor</span>
                <p className="text-xs text-slate-400">
                  Can create project drafts, invite viewers/editors, and review applications.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0d121f] border border-slate-800 flex flex-col gap-2">
                <span className="text-xs font-bold text-indigo-400 uppercase">Admin</span>
                <p className="text-xs text-slate-400">
                  Full authority. Can allocate budgets, promote admins, and archive projects.
                </p>
              </div>
            </div>
          </section>

          {/* API Contract */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-white">API Endpoint</h2>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
              POST /api/dehix/members<br />
              Headers: X-Agent-Token: &lt;token&gt; (for server/MCP auth)<br />
              Payload: {JSON.stringify({ project_id: 'string (optional)', email: 'string', role: 'viewer | editor | admin' }, null, 2)}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
