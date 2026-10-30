import React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { FolderKanban, Check, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function ProjectsDocsPage() {
  return (
    <div className="flex min-h-screen bg-[#080c14] text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Docs / Project Management" />

        <main className="p-8 max-w-4xl w-full mx-auto flex flex-col gap-8">
          <Link
            href="/docs"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Documentation Overview
          </Link>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-2">
              <FolderKanban className="w-4 h-4" />
              <span>PROJECT SPECIFICATION</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Project Creation & Budget Rules</h1>
            <p className="text-sm text-slate-400 mt-2">
              All projects registered on DEHIX must comply with the following monetary ceilings and validation specifications.
            </p>
          </div>

          {/* Core Rule Highlight */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
            <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-amber-300 text-sm">
                Strict Budget Limits: ₹10,000 – ₹10,00,000 INR
              </span>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Any project creation request with a budget less than ₹10,000 or greater than ₹10,00,000 (10 Lakhs) is rejected automatically by the platform API and must be blocked by autonomous agent policies.
              </p>
            </div>
          </div>

          {/* Detailed Rules Table */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-white">API Parameters & Constraints</h2>
            <div className="rounded-xl border border-slate-800 bg-[#0d121f] overflow-hidden text-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-900/60 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Parameter</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Constraint</th>
                    <th className="px-5 py-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 text-xs">
                  <tr>
                    <td className="px-5 py-3 font-mono text-blue-400">name</td>
                    <td className="px-5 py-3 font-mono text-slate-400">string</td>
                    <td className="px-5 py-3">Min 3 characters</td>
                    <td className="px-5 py-3">Project title or grant designation.</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-mono text-blue-400">budget</td>
                    <td className="px-5 py-3 font-mono text-slate-400">number (INR)</td>
                    <td className="px-5 py-3 font-semibold text-emerald-400">₹10,000 – ₹10,00,000</td>
                    <td className="px-5 py-3">Total project grant allocation in Indian Rupees.</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-mono text-blue-400">description</td>
                    <td className="px-5 py-3 font-mono text-slate-400">string</td>
                    <td className="px-5 py-3">Optional</td>
                    <td className="px-5 py-3">Scope of work and milestones.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Verification Protocol */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-white">Verification Protocol (Self-Verifying Agent)</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              When an AI agent calls <code className="text-blue-400">create_project</code> (<code className="text-slate-300">POST /api/dehix/projects</code>), it receives a response containing <code className="text-emerald-400">project_id</code>.
              The agent must subsequently invoke <code className="text-blue-400">get_project</code> (<code className="text-slate-300">GET /api/dehix/projects/get?id={'{id}'}</code>) to confirm that the project was committed with the exact requested name and budget.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
