import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Activity, 
  Clock, 
  Sparkles, 
  TrendingUp,
  ShieldCheck,
  Layers
} from 'lucide-react';

export default function MetricsGrid({ metrics }) {
  if (!metrics) return null;

  const cards = [
    {
      title: 'Total Inspections',
      value: metrics.totalInspections || 0,
      sub: 'All registered visual jobs',
      icon: Layers,
      color: 'text-brand-400',
      bg: 'bg-brand-500/10 border-brand-500/20'
    },
    {
      title: 'Pass Rate',
      value: `${metrics.passRate || 0}%`,
      sub: `${metrics.passed || 0} items cleared`,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Defect Failure Rate',
      value: `${metrics.failRate || 0}%`,
      sub: `${metrics.failed || 0} items quarantined`,
      icon: XCircle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20'
    },
    {
      title: 'Secondary Reviews',
      value: `${metrics.flagRate || 0}%`,
      sub: `${metrics.flagged || 0} items flagged`,
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      title: 'Mean AI Confidence',
      value: `${metrics.avgConfidence || 0}%`,
      sub: 'Gemini 2.5 Vision model',
      icon: Sparkles,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20'
    },
    {
      title: 'Avg Latency',
      value: metrics.totalInspections > 0 ? `${metrics.avgLatencyMs || 1420}ms` : '0ms',
      sub: 'Multi-modal inference pipeline',
      icon: Clock,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl border ${card.bg} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-100 tracking-tight font-mono">
              {card.value}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {card.sub}
            </p>
          </div>
        );
      })}
    </div>
  );
}

