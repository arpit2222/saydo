import React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ShieldAlert, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

export default function ApplicationsDocsPage() {
  return (
    <div className="flex min-h-screen bg-[#080c14] text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Docs / Application Decisions" />

        <main className="p-8 max-w-4xl w-full mx-auto flex flex-col gap-8">
          <Link
            href="/docs"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Documentation Overview
          </Link>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>DECISION PROTOCOL SPECIFICATION</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Application Review & Irreversibility</h1>
            <p className="text-sm text-slate-400 mt-2">
              Standard operating procedures for reviewing candidate pitches and recording grant awards.
            </p>
          </div>

          {/* Core Rule Highlight */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
            <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-amber-300 text-sm">
                Irreversible Decision Rule: Rejected Applications Cannot Be Reopened
              </span>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Once an application is marked as rejected, its status is terminal. The platform rejects any subsequent modifications or approval attempts. Candidates must submit a brand new proposal.
              </p>
            </div>
          </div>

          {/* Workflow Diagram */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-white">Application State Flow</h2>
            <div className="p-6 rounded-2xl bg-[#0d121f] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center w-full sm:w-auto">
                <span className="text-xs font-bold text-amber-400 uppercase">1. Submitted</span>
                <p className="text-[11px] text-slate-400 mt-1">Candidate enters pool</p>
              </div>

              <span className="text-slate-600 font-bold">&rarr;</span>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center w-full sm:w-auto">
                <span className="text-xs font-bold text-emerald-400 uppercase">2A. Accepted</span>
                <p className="text-[11px] text-slate-400 mt-1">Smart contract escrow unlocked</p>
              </div>

              <span className="text-slate-600 font-bold">OR</span>

              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center w-full sm:w-auto">
                <span className="text-xs font-bold text-rose-400 uppercase">2B. Rejected (Final)</span>
                <p className="text-[11px] text-slate-400 mt-1">Cannot be reopened</p>
              </div>
            </div>
          </section>

          {/* API Contract */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-white">API Decision Endpoint</h2>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
              POST /api/dehix/applications/decision<br />
              Headers: Content-Type: application/json<br />
              Payload: {JSON.stringify({ application_id: 'string', decision: 'accepted | rejected' }, null, 2)}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
