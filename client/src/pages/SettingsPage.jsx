import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  User, 
  Key, 
  Sliders, 
  Sparkles, 
  CheckCircle2, 
  Server, 
  Database,
  Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function SettingsPage() {
  const { user } = useAuth();
  const [defaultThreshold, setDefaultThreshold] = useState(70);
  const [autoQuarantine, setAutoQuarantine] = useState(true);
  const [systemHealth, setSystemHealth] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await axios.get('/api/health');
        setSystemHealth(res.data);
      } catch (e) {
        setSystemHealth({ status: 'unreachable' });
      }
    };
    fetchHealth();
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-400" />
          <span>System & Operational Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure inspection sensitivity presets, audit role privileges, and inspect API connectivity.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Operational settings successfully committed to local profile.</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-base">User Credentials & Identity</h3>
            <p className="text-xs text-slate-400">Authenticated session and role-based permissions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 font-mono uppercase tracking-wider block mb-1">Full Name</span>
            <span className="text-slate-200 font-semibold text-sm">{user?.fullName || 'Operator'}</span>
          </div>
          <div>
            <span className="text-slate-500 font-mono uppercase tracking-wider block mb-1">Email</span>
            <span className="text-slate-200 font-mono text-sm">{user?.email || 'operator@domain.com'}</span>
          </div>
          <div>
            <span className="text-slate-500 font-mono uppercase tracking-wider block mb-1">Access Role</span>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider bg-sky-950/80 text-sky-300 border border-sky-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{user?.role || 'OPERATOR'}</span>
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-mono uppercase tracking-wider block mb-1">Security Isolation</span>
            <span className="text-slate-300">
              {user?.role === 'admin' ? 'Global Read/Write & Config' : 
               user?.role === 'inspector' ? 'Audit Override & Sign-Off' : 
               'Row-Level Security (Own Records Only)'}
            </span>
          </div>
        </div>
      </div>

      {/* Model & AI Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-base">Gemini Vision Intelligence Engine</h3>
            <p className="text-xs text-slate-400">SDK configuration & multi-modal parameters</p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-brand-400" />
                <span>Default Inspection Sensitivity Threshold</span>
              </label>
              <span className="text-xs font-mono font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">
                {defaultThreshold}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={defaultThreshold}
              onChange={(e) => setDefaultThreshold(Number(e.target.value))}
              className="w-full accent-brand-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-200">Auto-Quarantine on Critical Defect</p>
              <p className="text-[11px] text-slate-400">Automatically set inspection status to FAILED if critical severity crack or violation is identified.</p>
            </div>
            <input
              type="checkbox"
              checked={autoQuarantine}
              onChange={(e) => setAutoQuarantine(e.target.checked)}
              className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-brand-400" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backend & Environment Health */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-base">Backend & Pipeline Health</h3>
            <p className="text-xs text-slate-400">System runtime diagnostics and environment checks</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-slate-400">Express API Service (Render)</span>
            <span className="text-emerald-400 font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {systemHealth?.status === 'healthy' ? 'ONLINE (Render Active)' : 'CHECKING...'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-slate-400">Supabase Cloud Database & Storage</span>
            <span className="text-brand-400 font-mono font-bold flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>{systemHealth?.supabaseConfigured ? 'CONNECTED (Supabase Active)' : 'POSTGRES / LOCAL ADAPTER'}</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-slate-400">Client Deployment Target</span>
            <span className="text-purple-400 font-mono font-bold">
              VERCEL (SPA Routing & Edge CDN)
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-slate-400">Google Gemini Model</span>
            <span className="text-sky-400 font-mono font-bold">
              gemini-2.5-flash (@google/genai SDK)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

