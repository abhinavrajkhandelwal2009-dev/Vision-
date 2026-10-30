import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ScanLine, 
  History, 
  Settings, 
  Layers, 
  SlidersHorizontal,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      desc: 'Overview & Metrics'
    },
    {
      to: '/inspect',
      label: 'New Inspection',
      icon: ScanLine,
      desc: 'Ingest & AI Analyze'
    },
    {
      to: '/history',
      label: 'Inspection History',
      icon: History,
      desc: 'Audit Trail & Reports'
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
      desc: 'Config & Profiles'
    }
  ];

  return (
    <aside 
      className={`bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="py-6 px-3">
        {/* Navigation links */}
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-3 py-3 rounded-xl transition-all group relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-brand-600/30 to-brand-500/10 text-brand-400 border border-brand-500/30 shadow-sm shadow-brand-500/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }
                `}
              >
                <div className={`p-2 rounded-lg transition-colors ${
                  window.location.pathname === item.to 
                    ? 'bg-brand-500/20 text-brand-400' 
                    : 'bg-slate-800 group-hover:bg-slate-700 text-slate-400 group-hover:text-slate-200'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{item.label}</div>
                    <div className="text-[11px] text-slate-500 truncate">{item.desc}</div>
                  </div>
                )}
                {!collapsed && (
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-transform group-hover:translate-x-0.5" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Domain Presets Card */}
        {!collapsed && (
          <div className="mt-8 p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-xs">
            <div className="flex items-center space-x-2 text-slate-300 font-semibold mb-2">
              <Layers className="w-4 h-4 text-brand-400" />
              <span>Inspection Profiles</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li className="flex items-center justify-between">
                <span>Industrial Defect</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </li>
              <li className="flex items-center justify-between">
                <span>Infrastructure & PPE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
              </li>
              <li className="flex items-center justify-between">
                <span>Retail Stock & Shelf</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Footer Role Banner */}
      <div className="p-3 border-t border-slate-800">
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20 animate-pulse"></div>
            {!collapsed && (
              <div className="truncate text-xs">
                <span className="text-slate-400 font-mono">ROLE: </span>
                <span className="text-white font-bold uppercase tracking-wider">{user?.role || 'OPERATOR'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

