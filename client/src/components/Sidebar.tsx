import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  PlusCircle,
  ListFilter,
  Flame,
  BarChart3,
  MapPin,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  const navItems = [
    // Citizen Navigation
    ...(user.role === 'CITIZEN'
      ? [
          { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { to: '/submit', label: t('submit_complaint'), icon: PlusCircle },
          { to: '/my-complaints', label: t('my_complaints'), icon: ListFilter },
          { to: '/map', label: t('map_view'), icon: MapPin },
        ]
      : []),

    // Field Officer Navigation
    ...(user.role === 'OFFICER'
      ? [
          { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { to: '/officer-tasks', label: t('officer_tasks'), icon: CheckCircle2 },
          { to: '/map', label: t('map_view'), icon: MapPin },
        ]
      : []),

    // Department Head Navigation
    ...(user.role === 'DEPARTMENT_HEAD'
      ? [
          { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { to: '/priority-queue', label: t('priority_queue'), icon: Flame },
          { to: '/dept-complaints', label: t('dept_complaints'), icon: Building2 },
          { to: '/map', label: t('map_view'), icon: MapPin },
          { to: '/analytics', label: t('analytics'), icon: BarChart3 },
        ]
      : []),

    // Admin Navigation
    ...(user.role === 'ADMIN'
      ? [
          { to: '/command-center', label: t('command_center'), icon: ShieldCheck },
          { to: '/priority-queue', label: t('priority_queue'), icon: Flame },
          { to: '/all-complaints', label: 'All Complaints', icon: ListFilter },
          { to: '/map', label: t('map_view'), icon: MapPin },
          { to: '/analytics', label: t('analytics'), icon: BarChart3 },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-40 transition-transform duration-300 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold tracking-wider uppercase text-slate-400">
            Navigation ({user.role})
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30 shadow-md shadow-sky-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* AI System Footer Status */}
        <div className="p-4 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-200">AI Intelligence Engine</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-slate-400">Rule & Gemini Dual Pipeline</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
