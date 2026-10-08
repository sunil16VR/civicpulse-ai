import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Building2,
  CheckCircle2,
  Star,
  Zap,
} from 'lucide-react';

const COLORS = ['#0284c7', '#f59e0b', '#f43f5e', '#10b981', '#6366f1', '#a855f7'];

export const AnalyticsView: React.FC = () => {
  const { t } = useLanguage();

  const [chartsData, setChartsData] = useState<any | null>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [chartRes, insightRes] = await Promise.all([
        api.get('/analytics/charts'),
        api.get('/analytics/insights'),
      ]);
      setChartsData(chartRes.data);
      setInsights(insightRes.data.insights || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRegenerateInsights = async () => {
    setRegenerating(true);
    try {
      const res = await api.post('/analytics/insights/regenerate');
      setInsights(res.data.insights || []);
    } catch (err) {
      console.error('Failed to regenerate insights:', err);
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
        Generating Recharts analytics & running AI Civic Insights Engine...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs mb-1">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span>Executive Analytics & Machine Learning Feedback Loop</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('analytics')}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual metrics on category density, department SLA compliance, citizen satisfaction, and AI Civic Insights.
          </p>
        </div>

        <button
          onClick={handleRegenerateInsights}
          disabled={regenerating}
          className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-sky-600/20 transition flex items-center gap-2 self-start sm:self-center disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{regenerating ? 'Regenerating AI Insights...' : 'Regenerate AI Insights'}</span>
        </button>
      </div>

      {/* AI Civic Insights Cards Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400" />
            <span>AI Civic Insights (Plain-Language Intelligence)</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Live Predictive Engine</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 hover:border-sky-500/40 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {item.type}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recharts Charts Grid */}
      {chartsData && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Category Distribution Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <span>Complaint Distribution by Category</span>
            </h3>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartsData.categoryDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" fill="#0284c7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Performance Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Department Resolution Rate (%)</span>
            </h3>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartsData.deptPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="resolutionRate" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* AI Learning Loop Category Resolution Benchmarks Table */}
      {chartsData?.categoryStats && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>AI Learning Loop: Historical Category Resolution Benchmarks</span>
            </h3>
            <span className="text-xs text-slate-400">Updated from actual resolutions & ratings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(chartsData.categoryStats).map(([categoryName, stat]: [string, any]) => (
              <div key={categoryName} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-white truncate">{categoryName}</div>
                <div className="text-slate-400">
                  Avg Time: <strong className="text-amber-300">{stat.avgHours} Hours</strong>
                </div>
                <div className="text-slate-400 flex items-center gap-1">
                  <span>Rating:</span>
                  <strong className="text-emerald-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {stat.avgRating}/5
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
