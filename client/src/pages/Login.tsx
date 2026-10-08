import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Activity, Lock, Mail, ArrowRight, Shield, User, Building, Wrench } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'ADMIN') {
        navigate('/command-center');
      } else if (loggedUser.role === 'DEPARTMENT_HEAD') {
        navigate('/priority-queue');
      } else if (loggedUser.role === 'OFFICER') {
        navigate('/officer-tasks');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Form Side */}
        <div className="p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">CivicPulse AI</h1>
                <p className="text-xs text-slate-400">Public Intelligence Portal</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-xs text-slate-400 mb-6">
              Sign in to manage, track, and resolve public complaints with predictive AI.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@civicpulse.org"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-sky-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-sky-400 font-semibold hover:underline">
              Create Citizen Account
            </Link>
          </div>
        </div>

        {/* Right Quick Demo Accounts Side */}
        <div className="p-6 sm:p-8 bg-slate-950/60 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 text-sky-400">
              <Shield className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Demo Accounts (1-Click Login)</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Select any role below to prefill test credentials (password: <code className="text-sky-300">password123</code>):
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setDemoAccount('admin@civicpulse.org')}
                className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-rose-500/30 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-rose-300">
                      System Admin
                    </div>
                    <div className="text-[11px] text-slate-400">admin@civicpulse.org</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  ADMIN
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('head.electrical@civicpulse.org')}
                className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300">
                      Electrical Dept Head
                    </div>
                    <div className="text-[11px] text-slate-400">head.electrical@civicpulse.org</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  HEAD
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('officer.ramesh@civicpulse.org')}
                className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-indigo-300">
                      Field Officer (Electrical)
                    </div>
                    <div className="text-[11px] text-slate-400">officer.ramesh@civicpulse.org</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  OFFICER
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('priya.citizen@gmail.com')}
                className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                      Resident Citizen
                    </div>
                    <div className="text-[11px] text-slate-400">priya.citizen@gmail.com</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  CITIZEN
                </span>
              </button>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            💡 <strong>Hackathon Tip:</strong> Use System Admin or Dept Head for priority queue & assignment demo flows!
          </div>
        </div>
      </div>
    </div>
  );
};
