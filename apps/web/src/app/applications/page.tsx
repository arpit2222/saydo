'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Mail, 
  Filter,
  Check,
  X
} from 'lucide-react';
import { Application } from '@/lib/dehix-store';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all' 
        ? '/api/dehix/applications' 
        : `/api/dehix/applications?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.applications) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();

    const handleSayDoChange = () => {
      fetchApplications();
    };

    window.addEventListener('saydo:changed', handleSayDoChange);
    return () => {
      window.removeEventListener('saydo:changed', handleSayDoChange);
    };
  }, [statusFilter]);

  const handleDecision = async (applicationId: string, decision: 'accepted' | 'rejected') => {
    setProcessingId(applicationId);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch('/api/dehix/applications/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: applicationId,
          decision,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record decision');
      }

      setActionSuccess(`Application ${decision === 'accepted' ? 'Accepted ✓' : 'Rejected ✗'}!`);
      fetchApplications();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#080c14] text-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Talent Applications" />

        <main className="p-8 max-w-7xl w-full mx-auto flex flex-col gap-8">
          {/* Notifications */}
          {actionSuccess && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
              <button onClick={() => setActionSuccess(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {actionError && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{actionError}</span>
              </div>
              <button onClick={() => setActionError(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Page Heading & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Talent & Grant Candidates</h2>
              <p className="text-sm text-slate-400">
                Review pitches, evaluate candidate credentials, and issue acceptance decisions.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0d121f] border border-slate-800 text-xs">
              {(['all', 'submitted', 'accepted', 'rejected'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                    statusFilter === s
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Applications Table */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d121f] overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-200 text-sm">
                <Users className="w-4 h-4 text-blue-400" />
                Candidate Submissions ({applications.length})
              </div>
              <span className="text-xs text-slate-500">
                Rule: Rejected applications are final
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 text-sm">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">No applications found in this category.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/60 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5">Candidate</th>
                      <th className="px-6 py-3.5">Project</th>
                      <th className="px-6 py-3.5">Pitch & Qualifications</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Decision Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{app.applicant_name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-500" />
                            {app.applicant_email}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-300">
                          {app.project_name || 'Website Revamp'}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400 max-w-sm leading-relaxed">
                          "{app.pitch}"
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                            app.status === 'accepted'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : app.status === 'rejected'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {app.status === 'accepted' && <Check className="w-3 h-3" />}
                            {app.status === 'rejected' && <X className="w-3 h-3" />}
                            {app.status === 'submitted' && <Clock className="w-3 h-3" />}
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {app.status === 'submitted' ? (
                            <div className="inline-flex items-center gap-2">
                              <button
                                disabled={processingId === app.id}
                                onClick={() => handleDecision(app.id, 'accepted')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all disabled:opacity-50"
                              >
                                Accept
                              </button>
                              <button
                                disabled={processingId === app.id}
                                onClick={() => handleDecision(app.id, 'rejected')}
                                className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          ) : app.status === 'rejected' ? (
                            <span className="text-xs text-slate-500 italic">
                              Terminal State
                            </span>
                          ) : (
                            <span className="text-xs text-emerald-400 font-medium">
                              Onboarding Active
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
