import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ScanLine, 
  BarChart3, 
  Layers, 
  ArrowUpRight, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Clock
} from 'lucide-react';
import MetricsGrid from '../components/MetricsGrid';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/analytics/summary');
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to load analytics summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-brand-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-brand-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ENTERPRISE VISUAL INTELLIGENCE OVERVIEW</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-brand-400">{user?.fullName || 'Operator'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time quality assurance telemetry and automated computer vision inspection metrics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchMetrics}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/inspect"
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 shadow-lg shadow-brand-500/20 hover:scale-[1.02] transition-all"
          >
            <ScanLine className="w-4 h-4" />
            <span>Launch Inspection</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <MetricsGrid metrics={summary} />

      {/* Charts & Domain Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Inspection Throughput */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-100 text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-400" />
                <span>Inspection Volume (Last 7 Days)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Automated visual inference throughput</p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
              7-Day Telemetry
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-2 pt-6 px-2">
            {(summary?.dailyVolume || [
              { day: 'Mon', inspections: 4 },
              { day: 'Tue', inspections: 8 },
              { day: 'Wed', inspections: 12 },
              { day: 'Thu', inspections: 7 },
              { day: 'Fri', inspections: 15 },
              { day: 'Sat', inspections: 9 },
              { day: 'Sun', inspections: 14 }
            ]).map((d, idx) => {
              const maxVal = Math.max(1, ...(summary?.dailyVolume || []).map(v => v.inspections), 15);
              const heightPct = Math.max(12, Math.round((d.inspections / maxVal) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[11px] font-mono font-bold text-slate-400 group-hover:text-brand-300 transition-colors">
                    {d.inspections}
                  </div>
                  <div className="w-full max-w-[48px] bg-slate-800/80 rounded-t-xl overflow-hidden h-40 flex items-end p-1">
                    <div
                      className="w-full bg-gradient-to-t from-brand-600 via-sky-500 to-brand-400 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${heightPct}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-mono text-slate-400 uppercase">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Domain Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-100 text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-400" />
                <span>Domain Profile Breakdown</span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">Inspection distribution across industry domains</p>

            <div className="space-y-4">
              {(summary?.domainBreakdown && summary.domainBreakdown.length > 0 ? summary.domainBreakdown : [
                { domain: 'Industrial Manufacturing', count: 18, percentage: 52 },
                { domain: 'Infrastructure & Safety', count: 10, percentage: 28 },
                { domain: 'Retail & Inventory', count: 7, percentage: 20 }
              ]).map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium truncate max-w-[200px]">
                      {item.domain}
                    </span>
                    <span className="font-mono text-slate-400">{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-sky-400" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <Link
              to="/history"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center justify-between group"
            >
              <span>Explore complete audit archive</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>

      </div>

      {/* Recent Inspection Activity Table Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-100 text-base">Recent Inspection Feed</h3>
            <p className="text-xs text-slate-400">Latest visual anomalies evaluated by the platform</p>
          </div>
          <Link
            to="/history"
            className="text-xs text-brand-400 hover:text-brand-300 font-medium"
          >
            View All →
          </Link>
        </div>

        {summary?.recentActivity && summary.recentActivity.length > 0 ? (
          <div className="divide-y divide-slate-800/80">
            {summary.recentActivity.map((item) => (
              <div 
                key={item.id} 
                onClick={() => navigate('/history')}
                className="py-3 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-850/50 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    item.status === 'passed' ? 'bg-emerald-400' :
                    item.status === 'failed' ? 'bg-rose-400' : 'bg-amber-400'
                  }`}></span>
                  <span className="font-semibold text-slate-200">{item.domain}</span>
                  <span className="text-slate-500 font-mono">[{item.id.slice(0, 8)}]</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-mono text-slate-300">{item.confidenceScore}% conf</span>
                  <span className="text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            No inspections recorded yet. Launch your first inspection to start streaming data!
          </div>
        )}
      </div>
    </div>
  );
}

