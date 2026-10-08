import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Star,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Building,
  Calendar,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal State
  const [reopenModalId, setReopenModalId] = useState<string | null>(null);
  const [reopenReason, setReopenReason] = useState('');

  const [feedbackModalId, setFeedbackModalId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');

  const fetchMyComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints/my');
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  // Citizen Confirmation
  const handleConfirm = async (id: string, confirmed: boolean) => {
    try {
      await api.post(`/complaints/${id}/confirm`, { confirmed });
      if (!confirmed) {
        setReopenModalId(id);
      } else {
        setFeedbackModalId(id);
        fetchMyComplaints();
      }
    } catch (err) {
      console.error('Confirmation error:', err);
    }
  };

  // Reopen Complaint
  const handleReopenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenModalId || !reopenReason) return;

    try {
      await api.post(`/complaints/${reopenModalId}/reopen`, { reason: reopenReason });
      setReopenModalId(null);
      setReopenReason('');
      fetchMyComplaints();
    } catch (err) {
      console.error('Reopen error:', err);
    }
  };

  // Submit Feedback
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackModalId) return;

    try {
      await api.post(`/complaints/${feedbackModalId}/feedback`, {
        rating,
        comment,
        citizenConfirmedResolved: true,
      });
      setFeedbackModalId(null);
      setComment('');
      fetchMyComplaints();
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  // Status Filter Lists & Counts
  const counts = {
    all: complaints.length,
    submitted: complaints.filter((c) => c.status === 'Submitted' || c.status === 'AI_Analyzed').length,
    inProgress: complaints.filter((c) => ['Assigned', 'In_Progress', 'Resolution_Submitted', 'Reopened'].includes(c.status)).length,
    resolved: complaints.filter((c) => c.status === 'Resolved').length,
  };

  const filteredComplaints = complaints.filter((c) => {
    if (filterStatus === 'SUBMITTED') return c.status === 'Submitted' || c.status === 'AI_Analyzed';
    if (filterStatus === 'IN_PROGRESS') return ['Assigned', 'In_Progress', 'Resolution_Submitted', 'Reopened'].includes(c.status);
    if (filterStatus === 'RESOLVED') return c.status === 'Resolved';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track your submitted complaints, confirm resolutions, or reopen unresolved issues.
          </p>
        </div>

        <Link
          to="/submit"
          className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-sky-600/20 transition flex items-center gap-2 self-start sm:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('submit_complaint')}</span>
        </Link>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`p-4 rounded-2xl border text-left transition ${
            filterStatus === 'ALL'
              ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">Total Reported</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{counts.all}</p>
        </button>

        <button
          onClick={() => setFilterStatus('SUBMITTED')}
          className={`p-4 rounded-2xl border text-left transition ${
            filterStatus === 'SUBMITTED'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">Pending / AI</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{counts.submitted}</p>
        </button>

        <button
          onClick={() => setFilterStatus('IN_PROGRESS')}
          className={`p-4 rounded-2xl border text-left transition ${
            filterStatus === 'IN_PROGRESS'
              ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
            <RefreshCw className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{counts.inProgress}</p>
        </button>

        <button
          onClick={() => setFilterStatus('RESOLVED')}
          className={`p-4 rounded-2xl border text-left transition ${
            filterStatus === 'RESOLVED'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{counts.resolved}</p>
        </button>
      </div>

      {/* Complaints List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-base font-bold text-white">My Complaint Activity</h2>
          <button
            onClick={fetchMyComplaints}
            className="text-xs text-sky-400 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
            Loading your submitted complaints...
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-xs text-slate-400">No complaints found under this view.</p>
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit a New Complaint</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-sky-400 font-bold">{c.displayId}</span>
                      <span className="text-xs font-bold text-white">{c.title}</span>
                      {c.isDuplicate && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-semibold">
                          Clustered Incident
                        </span>
                      )}
                      {c.status === 'Reopened' && (
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-semibold animate-pulse">
                          Reopened (+20 Priority)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description}</p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/30">
                      Priority: {c.priorityScore}/100
                    </span>
                    <Link
                      to={`/complaint/${c.id}`}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                      title="View Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between overflow-x-auto text-[11px] font-semibold text-slate-400">
                  <div className={`flex items-center gap-1.5 ${['Submitted', 'AI_Analyzed', 'Assigned', 'In_Progress', 'Resolution_Submitted', 'Resolved'].includes(c.status) ? 'text-sky-400' : ''}`}>
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    <span>Submitted</span>
                  </div>

                  <span className="text-slate-700">→</span>

                  <div className={`flex items-center gap-1.5 ${['AI_Analyzed', 'Assigned', 'In_Progress', 'Resolution_Submitted', 'Resolved'].includes(c.status) ? 'text-sky-400' : ''}`}>
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    <span>AI Analyzed</span>
                  </div>

                  <span className="text-slate-700">→</span>

                  <div className={`flex items-center gap-1.5 ${['Assigned', 'In_Progress', 'Resolution_Submitted', 'Resolved'].includes(c.status) ? 'text-indigo-400' : ''}`}>
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    <span>Assigned</span>
                  </div>

                  <span className="text-slate-700">→</span>

                  <div className={`flex items-center gap-1.5 ${['In_Progress', 'Resolution_Submitted', 'Resolved'].includes(c.status) ? 'text-amber-400' : ''}`}>
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    <span>In Progress</span>
                  </div>

                  <span className="text-slate-700">→</span>

                  <div className={`flex items-center gap-1.5 ${['Resolved'].includes(c.status) ? 'text-emerald-400' : ''}`}>
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    <span>Resolved</span>
                  </div>
                </div>

                {/* Citizen Resolution Confirmation Box if Status is Resolved */}
                {c.status === 'Resolved' && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-300">
                        Officer has marked this issue as Resolved. Please confirm:
                      </span>
                      {c.feedback?.rating && (
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{c.feedback.rating}/5 Rated</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleConfirm(c.id, true)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirmed Fixed 🎉</span>
                      </button>

                      <button
                        onClick={() => handleConfirm(c.id, false)}
                        className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Not Fixed (Reopen)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reopen Complaint Modal */}
      {reopenModalId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-400" />
              <span>Reopen Complaint</span>
            </h3>
            <p className="text-xs text-slate-400">
              Reopening will boost the complaint priority score by +20 points and alert the Admin Command Center.
            </p>

            <form onSubmit={handleReopenSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason for Reopening *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Explain why the issue is not fixed..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReopenModalId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                >
                  Confirm Reopen & Boost Priority
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModalId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              <span>Rate Resolution & Feedback</span>
            </h3>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-2 rounded-xl hover:bg-slate-800 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating ? 'text-amber-400 fill-current' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Comments (Optional)
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share feedback on resolution speed & quality..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModalId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
