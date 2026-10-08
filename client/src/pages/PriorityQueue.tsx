import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Flame,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Building,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';

export const PriorityQueue: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [minPriority, setMinPriority] = useState<number>(0);

  // Expanded "Why this priority?" Card ID
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Quick Assign Modal State
  const [assignModalComplaint, setAssignModalComplaint] = useState<any | null>(null);
  const [officers, setOfficers] = useState<any[]>([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchPriorityQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints', {
        params: {
          search,
          category: selectedCategory,
          status: selectedStatus,
          priorityMin: minPriority > 0 ? minPriority : undefined,
          sortBy: 'priorityScore',
          order: 'desc',
        },
      });
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error('Failed to fetch priority queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriorityQueue();
  }, [search, selectedCategory, selectedStatus, minPriority]);

  const openAssignModal = async (complaint: any) => {
    setAssignModalComplaint(complaint);
    try {
      const res = await api.get('/departments/officers', {
        params: { departmentId: complaint.departmentId || undefined },
      });
      setOfficers(res.data.officers || []);
    } catch (err) {
      console.error('Failed to load officers:', err);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalComplaint || !selectedOfficerId) return;

    setAssigning(true);
    try {
      await api.put(`/complaints/${assignModalComplaint.id}/assign`, {
        officerId: selectedOfficerId,
      });
      setAssignModalComplaint(null);
      setSelectedOfficerId('');
      fetchPriorityQueue();
    } catch (err) {
      console.error('Assignment error:', err);
    } finally {
      setAssigning(false);
    }
  };

  const getPriorityBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/10';
    if (score >= 60) return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10';
    if (score >= 40) return 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sky-500/10';
    return 'bg-slate-700/50 text-slate-300 border-slate-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs mb-1">
            <Flame className="w-4 h-4 animate-bounce text-rose-500" />
            <span>AI Predictive Priority Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {t('priority_queue')} (Hero Queue)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complaints dynamically ranked 0–100 by safety impact, severity, duration, and duplicate density.
          </p>
        </div>

        <button
          onClick={fetchPriorityQueue}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-2 self-start sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, keyword, address..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Category */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
        >
          <option value="">All Categories</option>
          <option value="Streetlight/Electrical">Streetlight/Electrical</option>
          <option value="Pothole/Road">Pothole/Road</option>
          <option value="Water Leakage">Water Leakage</option>
          <option value="Garbage/Sanitation">Garbage/Sanitation</option>
          <option value="Drainage">Drainage</option>
          <option value="Infrastructure Damage">Infrastructure Damage</option>
          <option value="Other">Other</option>
        </select>

        {/* Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
        >
          <option value="">All Statuses</option>
          <option value="Submitted">Submitted (Pending)</option>
          <option value="Assigned">Assigned</option>
          <option value="In_Progress">In Progress</option>
          <option value="Resolution_Submitted">Proof Submitted</option>
          <option value="Reopened">Reopened</option>
          <option value="Resolved">Resolved</option>
        </select>

        {/* Priority Filter */}
        <select
          value={minPriority}
          onChange={(e) => setMinPriority(parseInt(e.target.value))}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
        >
          <option value={0}>All Priority Scores</option>
          <option value={80}>Critical Only (Score ≥ 80)</option>
          <option value={60}>High Priority (Score ≥ 60)</option>
          <option value={40}>Medium Priority (Score ≥ 40)</option>
        </select>
      </div>

      {/* Priority Queue Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
            Calculating AI priority scores & SLA risk factors...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
            No complaints match the selected priority queue filters.
          </div>
        ) : (
          complaints.map((c, index) => {
            const isExpanded = expandedId === c.id;
            const priorityReasons = JSON.parse(c.priorityReasons || '[]');

            return (
              <div
                key={c.id}
                className={`bg-slate-900 border rounded-2xl p-5 transition-all space-y-4 shadow-lg ${
                  c.priorityScore >= 80
                    ? 'border-rose-500/30 hover:border-rose-500/50'
                    : c.priorityScore >= 60
                    ? 'border-amber-500/30 hover:border-amber-500/50'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Row: Rank Badge, ID, Title, Priority Score */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-400 flex-shrink-0">
                      #{index + 1}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs text-sky-400">{c.displayId}</span>
                        <h3 className="font-bold text-sm text-white">{c.title}</h3>
                        {c.isDuplicate && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-semibold">
                            Clustered
                          </span>
                        )}
                        {c.aiOverridden && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-semibold">
                            AI Overridden
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {c.translatedDescription || c.description}
                      </p>
                    </div>
                  </div>

                  {/* Priority Score Badge */}
                  <div className="flex items-center gap-2 self-start md:self-center">
                    <div
                      className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 shadow-lg ${getPriorityBadgeColor(
                        c.priorityScore
                      )}`}
                    >
                      <Zap className="w-4 h-4" />
                      <div className="text-left">
                        <div className="text-[10px] uppercase font-bold tracking-wider">AI Priority</div>
                        <div className="text-sm font-black font-mono leading-none">
                          {c.priorityScore} / 100
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/complaint/${c.id}`}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="View Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Metadata Tags Row */}
                <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-800/80">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-sky-400" />
                    <span>{c.department?.name || 'General Dept'}</span>
                  </span>

                  <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    Category: <strong>{c.category}</strong>
                  </span>

                  <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    Severity: <strong>{c.severity}</strong>
                  </span>

                  <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span className="truncate max-w-[150px]">{c.addressText}</span>
                  </span>

                  {c.calculatedSlaRisk === 'High' && (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 font-bold animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>SLA Breach Risk High!</span>
                    </span>
                  )}
                </div>

                {/* Assigned Officer / Quick Assign Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-sky-400" />
                    <span>
                      Officer:{' '}
                      <strong className="text-slate-200">
                        {c.assignedOfficer ? c.assignedOfficer.name : 'Unassigned'}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Expand Why Priority Button */}
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : c.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-sky-400 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Why this priority?</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {/* Quick Assign Button for Dept Head or Admin */}
                    {(user?.role === 'ADMIN' || user?.role === 'DEPARTMENT_HEAD') && (
                      <button
                        type="button"
                        onClick={() => openAssignModal(c)}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition"
                      >
                        {c.assignedOfficer ? 'Reassign Officer' : 'Quick Assign'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable "Why this priority?" Point Breakdown */}
                {isExpanded && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 animate-fadeIn">
                    <div className="font-bold text-sky-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Explainable AI (XAI) Point Breakdown</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {priorityReasons.map((reason: string, rIdx: number) => (
                        <div
                          key={rIdx}
                          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
                        >
                          {reason}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quick Officer Assign Modal */}
      {assignModalComplaint && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-sky-400" />
              <span>Assign Officer to {assignModalComplaint.displayId}</span>
            </h3>

            <p className="text-xs text-slate-400">
              Department: <strong>{assignModalComplaint.department?.name || 'General'}</strong>
            </p>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Field Officer (Showing Workload Tasks) *
                </label>
                <select
                  required
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="">-- Choose Field Officer --</option>
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.activeTasksCount} active tasks | Dept: {o.departmentName || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalComplaint(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {assigning ? 'Assigning...' : 'Confirm Officer Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
