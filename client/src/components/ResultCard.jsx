import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronRight, 
  FileText, 
  Save, 
  Download, 
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import axios from 'axios';

export default function ResultCard({ 
  inspection, 
  selectedAnomalyId, 
  onSelectAnomaly,
  onInspectionUpdated 
}) {
  if (!inspection) return null;

  const aiOutput = inspection.aiOutput || {};
  const anomalies = aiOutput.anomaliesDetected || [];
  const status = inspection.status || 'pending';
  const confidence = inspection.confidenceScore || aiOutput.confidenceScore || 0;

  const [notes, setNotes] = useState(inspection.operatorNotes || '');
  const [overrideStatus, setOverrideStatus] = useState(inspection.status || 'pending');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const getStatusBadge = (st) => {
    switch (st?.toLowerCase()) {
      case 'passed':
        return {
          icon: CheckCircle2,
          label: 'PASSED',
          bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60',
          barColor: 'bg-emerald-500'
        };
      case 'failed':
        return {
          icon: XCircle,
          label: 'FAILED',
          bg: 'bg-rose-950/60 text-rose-300 border-rose-700/60',
          barColor: 'bg-rose-500'
        };
      case 'flagged':
      case 'flagged_for_review':
        return {
          icon: AlertTriangle,
          label: 'FLAGGED FOR REVIEW',
          bg: 'bg-amber-950/60 text-amber-300 border-amber-700/60',
          barColor: 'bg-amber-500'
        };
      default:
        return {
          icon: Clock,
          label: 'PENDING',
          bg: 'bg-slate-850 text-slate-300 border-slate-700',
          barColor: 'bg-brand-500'
        };
    }
  };

  const statusConfig = getStatusBadge(status);
  const StatusIcon = statusConfig.icon;

  const getSeverityBadge = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-950/80 text-red-300 border-red-700/50';
      case 'HIGH':
        return 'bg-orange-950/80 text-orange-300 border-orange-700/50';
      case 'MEDIUM':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/50';
      case 'LOW':
      default:
        return 'bg-sky-950/80 text-sky-300 border-sky-700/50';
    }
  };

  const handleSaveAudit = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      const res = await axios.patch(`/api/inspections/${inspection.id}`, {
        status: overrideStatus,
        operator_notes: notes
      });
      setSavedSuccess(true);
      if (onInspectionUpdated) {
        onInspectionUpdated(res.data.inspection);
      }
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update inspection:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportSummary = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Inspection ID,Domain,Status,Confidence,Anomalies Count,Created At",
         `"${inspection.id}","${inspection.domain}","${status}","${confidence}%","${anomalies.length}","${inspection.createdAt}"`
        ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inspection_Report_${inspection.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header / Primary Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
            AI EVALUATION OUTCOME
          </span>
          <div className="flex items-center space-x-3 mt-1">
            <span className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-sm font-bold tracking-wide ${statusConfig.bg}`}>
              <StatusIcon className="w-4 h-4" />
              <span>{statusConfig.label}</span>
            </span>
            <span className="text-xs font-mono text-slate-400">
              Ref: <span className="text-slate-200">{inspection.id?.slice(0, 8)}</span>
            </span>
          </div>
        </div>

        {/* Confidence Gauge */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 w-full sm:w-56">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Model Confidence</span>
            <span className="font-mono font-bold text-slate-100 text-sm">{confidence}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${statusConfig.barColor}`} 
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* AI Summary Section */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Executive Visual Summary</span>
        </h4>
        <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
          {aiOutput.summary || 'Visual asset evaluated against domain parameters. No critical deviations.'}
        </p>
      </div>

      {/* Anomalies List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Detected Irregularities ({anomalies.length})
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">Click item to highlight in canvas</span>
        </div>

        {anomalies.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Clean scan: Zero structural defects or compliance anomalies detected within configured sensitivity.</span>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {anomalies.map((anom, idx) => {
              const anomId = anom.id || `anom-${idx + 1}`;
              const isSelected = selectedAnomalyId === anomId;

              return (
                <div
                  key={anomId}
                  onClick={() => onSelectAnomaly && onSelectAnomaly(anomId)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-500/10 border-brand-500/50 shadow-md ring-1 ring-brand-500/30'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2 font-medium text-sm text-slate-200">
                      <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 text-xs flex items-center justify-center font-mono font-bold">
                        {idx + 1}
                      </span>
                      <span>{anom.title}</span>
                    </div>
                    <span className={`text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded border ${getSeverityBadge(anom.severity)}`}>
                      {anom.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 pl-7 leading-relaxed">
                    {anom.description}
                  </p>
                  {anom.boundingBox && (
                    <div className="pl-7 mt-2 text-[10px] font-mono text-slate-500">
                      Coordinates: [Y: {anom.boundingBox.ymin}–{anom.boundingBox.ymax}, X: {anom.boundingBox.xmin}–{anom.boundingBox.xmax}]
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Operational Recommendations */}
      {aiOutput.recommendedAction && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/40 to-slate-900 border border-sky-800/40">
          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300 mb-1 flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
            <span>Recommended Operational Action</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {aiOutput.recommendedAction}
          </p>
        </div>
      )}

      {/* Operator Review & Status Override */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Inspector Override & Audit Notes
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Verify / Override Status
            </label>
            <select
              value={overrideStatus}
              onChange={(e) => setOverrideStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="passed">Passed (Cleared for Release)</option>
              <option value="failed">Failed (Defect Confirmed)</option>
              <option value="flagged_for_review">Flagged For Review (Secondary Audit)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Export Audit Artifact
            </label>
            <button
              onClick={handleExportSummary}
              className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV Record</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Operator Notes / Sign-Off Comments
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Document operator notes, physical inspection cross-checks, or batch serials..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          ></textarea>
        </div>

        <div className="flex items-center justify-between pt-1">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Changes saved to PostgreSQL audit trail!
            </span>
          )}
          {!savedSuccess && <span></span>}

          <button
            onClick={handleSaveAudit}
            disabled={isSaving}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-semibold border border-slate-700 transition-colors shadow-sm ml-auto"
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-brand-400" />
                <span>Save Review Update</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}

