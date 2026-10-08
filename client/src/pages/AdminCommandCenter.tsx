import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  RefreshCw,
  Search,
  SlidersHorizontal,
  UserCheck,
  CheckSquare,
  XCircle,
  Sparkles,
  ArrowRight,
  Edit,
} from 'lucide-react';

export const AdminCommandCenter: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  // Modals
  const [verifyModalComplaint, setVerifyModalComplaint] = useState<any | null>(null);
  const [verificationNote, setVerificationNote] = useState('');

  const [overrideModalComplaint, setOverrideModalComplaint] = useState<any | null>(null);
  const [overrideField, setOverrideField] = useState('priorityScore');
  const [overrideValue, setOverrideValue] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, compRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/complaints', {
          params: { search, category, status, sortBy: 'priorityScore', order: 'desc' },
        }),
      ]);
      setSummary(sumRes.data);
      setComplaints(compRes.data.complaints || []);
    } catch (err) {
      console.error('Failed to load command center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, category, status]);

  // Admin Verification Submit
  const handleVerifySubmit = async (approved: boolean) => {
    if (!verifyModalComplaint) return;
    try {
      await api.put(`/complaints/${verifyModalComplaint.id}/verify`, {
        approved,
        verificationNote,
      });
      setVerifyModalComplaint(null);
      setVerificationNote('');
      fetchData();
    } catch (err) {
      console.error('Verification error:', err);
    }
  };

  // AI Override Submit
  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideModalComplaint || !overrideValue || !overrideReason) return;
    try {
      await api.post(`/complaints/${overrideModalComplaint.id}/override`, {
        field: overrideField,
        newValue: overrideValue,
        reason: overrideReason,
      });
      setOverrideModalComplaint(null);
      setOverrideValue('');
      setOverrideReason('');
      fetchData();
    } catch (err) {
      console.error('Override error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-1">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>Admin Executive Intelligence Command Center</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Command Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time oversight of priority queues, SLA breach risks, resolution verification, and AI overrides.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-sky-600/20 transition flex items-center gap-2 self-start sm:self-center"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards Summary */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
            <p className="text-xl font-black text-white mt-1">{summary.totalComplaints}</p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <span className="text-[10px] uppercase font-bold">Critical</span>
            <p className="text-xl font-black text-rose-300 mt-1">{summary.criticalIssues}</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <span className="text-[10px] uppercase font-bold">Pending</span>
            <p className="text-xl font-black text-amber-300 mt-1">{summary.pending}</p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <span className="text-[10px] uppercase font-bold">Active</span>
            <p className="text-xl font-black text-indigo-300 mt-1">{summary.active}</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <span className="text-[10px] uppercase font-bold">Resolved</span>
            <p className="text-xl font-black text-emerald-300 mt-1">{summary.resolved}</p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 animate-pulse">
            <span className="text-[10px] uppercase font-bold">SLA Risk</span>
            <p className="text-xl font-black text-rose-200 mt-1">{summary.slaAtRisk}</p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <span className="text-[10px] uppercase font-bold">Clustered</span>
            <p className="text-xl font-black text-purple-300 mt-1">{summary.duplicatesMerged}</p>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, keyword, citizen, officer..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option value="">All Categories</option>
            <option value="Streetlight/Electrical">Streetlight/Electrical</option>
            <option value="Pothole/Road">Pothole/Road</option>
            <option value="Water Leakage">Water Leakage</option>
            <option value="Garbage/Sanitation">Garbage/Sanitation</option>
            <option value="Drainage">Drainage</option>
            <option value="Infrastructure Damage">Infrastructure Damage</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option value="">All Statuses</option>
            <option value="Resolution_Submitted">Proof Submitted (Verification Pending)</option>
            <option value="Submitted">Submitted (Unassigned)</option>
            <option value="In_Progress">In Progress</option>
            <option value="Reopened">Reopened</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Main Command Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            <span>Priority Queue & Resolution Verification Engine</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Total: {complaints.length} records</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
            Loading Command Center operational database...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  <th className="p-4">Display ID & Title</th>
                  <th className="p-4">Category & Dept</th>
                  <th className="p-4">AI Score</th>
                  <th className="p-4">Status & SLA</th>
                  <th className="p-4">Officer</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    {/* Display ID & Title */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sky-400">{c.displayId}</span>
                        {c.isDuplicate && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded">
                            Cluster
                          </span>
                        )}
                        {c.aiOverridden && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded">
                            Override
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-white mt-0.5">{c.title}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{c.addressText}</div>
                    </td>

                    {/* Category & Dept */}
                    <td className="p-4">
                      <div className="font-medium text-slate-200">{c.category}</div>
                      <div className="text-[11px] text-sky-400 font-medium">
                        {c.department?.name || 'Unassigned Dept'}
                      </div>
                    </td>

                    {/* Priority Score */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-xs border ${
                            c.priorityScore >= 80
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : c.priorityScore >= 60
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          }`}
                        >
                          {c.priorityScore}/100
                        </span>
                      </div>
                    </td>

                    {/* Status & SLA */}
                    <td className="p-4">
                      <div className="font-semibold text-slate-200">{c.status}</div>
                      {c.calculatedSlaRisk === 'High' && (
                        <div className="text-[10px] text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3 animate-pulse" />
                          <span>SLA Risk High</span>
                        </div>
                      )}
                    </td>

                    {/* Officer */}
                    <td className="p-4">
                      {c.assignedOfficer ? (
                        <div className="text-slate-200 font-medium">{c.assignedOfficer.name}</div>
                      ) : (
                        <span className="text-[11px] text-amber-400 font-bold">Unassigned</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2">
                      {/* Resolution Verification Button */}
                      {c.status === 'Resolution_Submitted' && (
                        <button
                          onClick={() => setVerifyModalComplaint(c)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition inline-flex items-center gap-1"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Verify Proof</span>
                        </button>
                      )}

                      {/* AI Override Button */}
                      <button
                        onClick={() => setOverrideModalComplaint(c)}
                        className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-[11px] font-bold rounded-lg transition inline-flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>AI Override</span>
                      </button>

                      <Link
                        to={`/complaint/${c.id}`}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg transition inline-flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Resolution Verification Modal */}
      {verifyModalComplaint && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
              <span>Verify Resolution Proof: {verifyModalComplaint.displayId}</span>
            </h3>

            {verifyModalComplaint.resolution && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-sky-400">Submitted Resolution Report:</div>
                <p className="text-slate-300">{verifyModalComplaint.resolution.description}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Verification Note / Rejection Reason
              </label>
              <textarea
                rows={3}
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                placeholder="Enter audit note for citizen or officer..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVerifyModalComplaint(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleVerifySubmit(false)}
                className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Proof (Back to Officer)</span>
              </button>
              <button
                type="button"
                onClick={() => handleVerifySubmit(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Mark Resolved</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI / Admin Override Modal */}
      {overrideModalComplaint && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>AI & System Override: {overrideModalComplaint.displayId}</span>
            </h3>

            <p className="text-xs text-slate-400">
              Admin overrides are logged into the permanent audit trail (<code className="text-purple-300">OverrideLog</code>).
            </p>

            <form onSubmit={handleOverrideSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Field</label>
                <select
                  value={overrideField}
                  onChange={(e) => setOverrideField(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="priorityScore">Priority Score (0-100)</option>
                  <option value="category">Category</option>
                  <option value="departmentId">Department</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Value *</label>
                <input
                  type="text"
                  required
                  value={overrideValue}
                  onChange={(e) => setOverrideValue(e.target.value)}
                  placeholder="e.g. 95 or Electrical Maintenance"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Required Justification Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="State why AI decision is being overridden by Admin..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalComplaint(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                >
                  Apply & Log Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
