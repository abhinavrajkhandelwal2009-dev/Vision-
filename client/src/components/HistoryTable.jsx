import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  Shield
} from 'lucide-react';

export default function HistoryTable({ 
  inspections = [], 
  page = 1, 
  onPageChange, 
  onSelectInspection,
  filterDomain,
  setFilterDomain,
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery
}) {
  const getStatusBadge = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'passed':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>PASSED</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-rose-950/70 text-rose-300 border border-rose-800/60">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>FAILED</span>
          </span>
        );
      case 'flagged':
      case 'flagged_for_review':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-amber-950/70 text-amber-300 border border-amber-800/60">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>FLAGGED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-slate-800 text-slate-300 border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>PENDING</span>
          </span>
        );
    }
  };

  const handleExportAll = () => {
    if (inspections.length === 0) return;
    const header = "ID,Domain,Status,ConfidenceScore,Operator,CreatedAt\n";
    const rows = inspections.map(i => 
      `"${i.id}","${i.domain}","${i.status}","${i.confidenceScore}%","${i.operatorName || 'Operator'}","${i.createdAt}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VisionIntelligence_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Search and Filters Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search domain, notes, or anomaly description..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/70 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Filters & Export */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="flagged_for_review">Flagged for Review</option>
          </select>

          <select
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500 max-w-[200px] truncate"
          >
            <option value="">All Domains</option>
            <option value="Industrial Manufacturing: Weld Cracks & Seam Flaws">Industrial Manufacturing</option>
            <option value="Infrastructure & Safety: PPE & Hazard Verification">Infrastructure & Safety</option>
            <option value="Retail & Inventory: Stock Depletion & Facing Compliance">Retail & Inventory</option>
          </select>

          <button
            onClick={handleExportAll}
            disabled={inspections.length === 0}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/70 uppercase font-mono tracking-wider text-slate-400 border-b border-slate-800 text-[11px]">
            <tr>
              <th className="py-3 px-4">Specimen</th>
              <th className="py-3 px-4">Job ID & Timestamp</th>
              <th className="py-3 px-4">Inspection Domain</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">AI Confidence</th>
              <th className="py-3 px-4">Operator</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {inspections.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-500 font-mono">
                  No visual inspection records found matching criteria.
                </td>
              </tr>
            ) : (
              inspections.map((row) => (
                <tr 
                  key={row.id}
                  className="hover:bg-slate-850/60 transition-colors group"
                >
                  {/* Thumbnail */}
                  <td className="py-3 px-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
                      <img
                        src={row.imageUrl}
                        alt="Thumbnail"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </td>

                  {/* ID & Date */}
                  <td className="py-3 px-4">
                    <div className="font-mono font-semibold text-slate-200">
                      {row.id?.slice(0, 8)}...
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {new Date(row.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>

                  {/* Domain */}
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-200 max-w-xs truncate">
                      {row.domain}
                    </div>
                    {row.aiOutput?.anomaliesDetected?.length > 0 && (
                      <span className="text-[10px] text-amber-400 font-mono">
                        {row.aiOutput.anomaliesDetected.length} defect(s) detected
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    {getStatusBadge(row.status)}
                  </td>

                  {/* Confidence */}
                  <td className="py-3 px-4 font-mono font-bold">
                    <span className={
                      row.confidenceScore >= 90 ? 'text-emerald-400' :
                      row.confidenceScore >= 75 ? 'text-brand-400' : 'text-amber-400'
                    }>
                      {row.confidenceScore}%
                    </span>
                  </td>

                  {/* Operator */}
                  <td className="py-3 px-4">
                    <div className="text-slate-300 font-medium truncate max-w-[120px]">
                      {row.operatorName || 'System'}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectInspection && onSelectInspection(row)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-brand-600 hover:text-white text-slate-300 font-medium transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing page <span className="font-mono text-slate-200 font-bold">{page}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange && onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange && onPageChange(page + 1)}
            disabled={inspections.length < 20}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

