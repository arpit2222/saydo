'use client';

import React from 'react';

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-12 max-w-6xl mx-auto flex flex-col gap-12">
      {/* Top Banner / Hero */}
      <header className="flex flex-col gap-4 border-b border-slate-800 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center font-bold text-black text-xl shadow-lg shadow-emerald-500/20">
              SD
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                SayDo
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Nebius x NVIDIA Track
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Record once by voice. Your app works with every AI agent.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              API: <code className="text-emerald-400">localhost:4000</code>
            </span>
          </div>
        </div>
      </header>

      {/* Grid of Key Architecture Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
          <div className="text-emerald-400 font-semibold text-sm flex items-center gap-2">
            <span>⚡</span> Nebius Token Factory
          </div>
          <h2 className="text-lg font-bold text-slate-100">Nemotron 3-Tier Routing</h2>
          <p className="text-sm text-slate-400">
            Nano/Super for instant JSON skill compilation, Super for the agent tool-loop, and Ultra for multi-intent reasoning.
          </p>
          <a
            href="http://localhost:4000/v1/health/models"
            target="_blank"
            rel="noreferrer"
            className="mt-auto text-xs text-emerald-400 hover:text-emerald-300 underline font-mono"
          >
            Check /v1/health/models &rarr;
          </a>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
          <div className="text-cyan-400 font-semibold text-sm flex items-center gap-2">
            <span>🔍</span> Tavily AI
          </div>
          <h2 className="text-lg font-bold text-slate-100">Docs Discovery & Drift Watch</h2>
          <p className="text-sm text-slate-400">
            Extracts documentation into candidate skills and spoken policies, grounds answers via <code className="text-slate-300">ask_docs</code>, and monitors changelog drift.
          </p>
          <span className="mt-auto text-xs text-slate-500 font-mono">
            Powered by Tavily Core API
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
          <div className="text-purple-400 font-semibold text-sm flex items-center gap-2">
            <span>🛡️</span> Zero Secret Storage
          </div>
          <h2 className="text-lg font-bold text-slate-100">Browser-Side Execution</h2>
          <p className="text-sm text-slate-400">
            Executes requests directly with the user’s authenticated session. Cookies and auth tokens never leave the browser.
          </p>
          <span className="mt-auto text-xs text-slate-500 font-mono">
            Pure Shadow DOM SDK
          </span>
        </div>
      </section>

      {/* Demo App & Host Quickstart */}
      <section className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col gap-4">
        <h3 className="text-base font-semibold text-slate-200">
          Demo Host App: DEHIX-lite
        </h3>
        <p className="text-sm text-slate-400 max-w-2xl">
          SayDo includes a pre-configured mock host application (DEHIX-lite) with seed projects, team members, and verification endpoints to test voice skill recording, policy enforcement, and MCP exports.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href="/projects"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            Launch DEHIX-lite &rarr;
          </a>
          <a
            href="/applications"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            Applications
          </a>
          <a
            href="/docs"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            Docs
          </a>
          <a
            href="/changelog"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            Changelog
          </a>
        </div>
        <div className="flex items-center gap-4 pt-1">
          <div className="px-3 py-1 rounded-lg bg-black/40 border border-slate-800 font-mono text-xs text-slate-300">
            Demo Public Key: <span className="text-emerald-400">pk_demo_dehix</span>
          </div>
          <div className="px-3 py-1 rounded-lg bg-black/40 border border-slate-800 font-mono text-xs text-slate-300">
            Port: <span className="text-cyan-400">3000 (Web) / 4000 (API)</span>
          </div>
        </div>
      </section>
    </main>
  );
}
