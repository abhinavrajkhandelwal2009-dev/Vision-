import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  History, 
  RefreshCw, 
  X, 
  Eye, 
  Download, 
  AlertCircle,
  Clock
} from 'lucide-react';
import HistoryTable from '../components/HistoryTable';
import InspectionCanvas from '../components/InspectionCanvas';
import ResultCard from '../components/ResultCard';

export default function HistoryPage() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterDomain, setFilterDomain] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [selectedAnomalyId, setSelectedAnomalyId] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (filterDomain) params.domain = filterDomain;
      if (filterStatus) params.status = filterStatus;
      if (searchQuery) params.search = searchQuery;

      const res = await axios.get('/api/inspections', { params });
      setInspections(res.data.inspections || []);
    } catch (err) {
      console.error('Failed to fetch inspection history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, filterDomain, filterStatus]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectInspection = (item) => {
    setSelectedInspection(item);
    const anomalies = item.aiOutput?.anomaliesDetected || [];
    if (anomalies.length > 0) {
      setSelectedAnomalyId(anomalies[0].id || 'anom-1');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-brand-400" />
            <span>Historical Inspection Archive & Audit Trail</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Query past multi-modal inspections, verify operator notes, and export compliance audit logs.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="flex items-center space-x-2 text-xs font-semibold px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Main Table */}
      <HistoryTable
        inspections={inspections}
        page={page}
        onPageChange={setPage}
        onSelectInspection={handleSelectInspection}
        filterDomain={filterDomain}
        setFilterDomain={setFilterDomain}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Detailed Modal Overlay when an inspection is opened */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  ID: {selectedInspection.id}
                </span>
                <span className="text-sm font-semibold text-white">
                  {selectedInspection.domain}
                </span>
              </div>
              <button
                onClick={() => setSelectedInspection(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <InspectionCanvas
                  imageUrl={selectedInspection.imageUrl}
                  anomalies={selectedInspection.aiOutput?.anomaliesDetected || []}
                  selectedAnomalyId={selectedAnomalyId}
                  onSelectAnomaly={setSelectedAnomalyId}
                />
              </div>

              <div className="lg:col-span-5">
                <ResultCard
                  inspection={selectedInspection}
                  selectedAnomalyId={selectedAnomalyId}
                  onSelectAnomaly={setSelectedAnomalyId}
                  onInspectionUpdated={(updated) => {
                    setSelectedInspection(prev => ({ ...prev, ...updated }));
                    fetchHistory();
                  }}
                />
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

