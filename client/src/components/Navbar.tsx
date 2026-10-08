import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldAlert,
  Globe,
  User as UserIcon,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  Activity,
} from 'lucide-react';

export const Navbar: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'DEPARTMENT_HEAD':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'OFFICER':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'CITIZEN':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return t('role_admin');
      case 'DEPARTMENT_HEAD':
        return t('role_dept_head');
      case 'OFFICER':
        return t('role_officer');
      case 'CITIZEN':
      default:
        return t('role_citizen');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Side: Brand Logo & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">CivicPulse AI</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Predictive Complaint Intelligence
              </p>
            </div>
          </Link>
        </div>

        {/* Right Side: Actions, Language & Auth */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>{language === 'en' ? 'தமிழ் (TA)' : 'English (EN)'}</span>
          </button>

          {/* User Status / Login Buttons */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition text-left"
              >
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-sky-400 font-semibold text-xs border border-slate-600">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">
                    {user.name}
                  </div>
                  <span
                    className={`inline-block text-[10px] font-semibold border px-1.5 py-0.2 rounded ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-2 z-50 divide-y divide-slate-700">
                  <div className="px-4 py-2">
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    {user.departmentName && (
                      <p className="text-[10px] text-sky-400 font-medium mt-1">
                        Dept: {user.departmentName}
                      </p>
                    )}
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-xs text-rose-400 hover:bg-slate-700/50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('login')}</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('register')}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
