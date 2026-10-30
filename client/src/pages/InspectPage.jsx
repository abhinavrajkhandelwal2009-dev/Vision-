import React, { useState } from 'react';
import axios from 'axios';
import { 
  ScanLine, 
  Sparkles, 
  AlertCircle, 
  ArrowLeft, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import FileUploadZone from '../components/FileUploadZone';
import InspectionCanvas from '../components/InspectionCanvas';
import ResultCard from '../components/ResultCard';

export default function InspectPage() {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [domain, setDomain] = useState('Industrial Manufacturing: Weld Cracks & Seam Flaws');
  const [threshold, setThreshold] = useState(70);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Completed inspection result
  const [currentInspection, setCurrentInspection] = useState(null);
  const [selectedAnomalyId, setSelectedAnomalyId] = useState(null);

  const handleAssetSelected = (asset) => {
    setSelectedAsset(asset);
    setErrorMsg('');
  };

  const handleClear = () => {
    setSelectedAsset(null);
    setCurrentInspection(null);
    setSelectedAnomalyId(null);
    setErrorMsg('');
  };

  const handleRunAnalysis = async () => {
    if (!selectedAsset) return;
    setIsAnalyzing(true);
    setErrorMsg('');

    try {
      const payload = {
        domain,
        imageBase64: selectedAsset.base64,
        mimeType: selectedAsset.mimeType,
        threshold,
        operatorNotes: `Initial inspection run under ${threshold}% sensitivity threshold.`
      };

      const res = await axios.post('/api/inspect', payload);
      setCurrentInspection(res.data.inspection);
      
      // Auto-select first anomaly if present
      const anomalies = res.data.inspection?.aiOutput?.anomaliesDetected || [];
      if (anomalies.length > 0) {
        setSelectedAnomalyId(anomalies[0].id || 'anom-1');
      }
    } catch (err) {
      console.error('Inspection execution error:', err);
      setErrorMsg(err.response?.data?.error || err.message || 'Inspection failed to complete.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ScanLine className="w-6 h-6 text-brand-400" />
            <span>Multi-Modal Visual Inspection Workspace</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ingest visual assets, execute automated Gemini Vision analysis, and interact with bounding overlays.
          </p>
        </div>

        {currentInspection && (
          <button
            onClick={handleClear}
            className="flex items-center space-x-2 text-xs font-semibold px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main View: Ingestion or Analysis Results */}
      {!currentInspection ? (
        <div className="max-w-4xl mx-auto">
          <FileUploadZone
            onAssetSelected={handleAssetSelected}
            selectedAsset={selectedAsset}
            onClear={handleClear}
            domain={domain}
            setDomain={setDomain}
            threshold={threshold}
            setThreshold={setThreshold}
            isAnalyzing={isAnalyzing}
            onRunAnalysis={handleRunAnalysis}
          />
        </div>
      ) : (
        /* Dual-pane Result Inspection Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Annotation Canvas */}
          <div className="lg:col-span-7 xl:col-span-8">
            <InspectionCanvas
              imageUrl={currentInspection.imageUrl}
              anomalies={currentInspection.aiOutput?.anomaliesDetected || []}
              selectedAnomalyId={selectedAnomalyId}
              onSelectAnomaly={setSelectedAnomalyId}
            />
          </div>

          {/* Right: Structured Result Card & Review Controls */}
          <div className="lg:col-span-5 xl:col-span-4">
            <ResultCard
              inspection={currentInspection}
              selectedAnomalyId={selectedAnomalyId}
              onSelectAnomaly={setSelectedAnomalyId}
              onInspectionUpdated={(updated) => {
                setCurrentInspection(prev => ({ ...prev, ...updated }));
              }}
            />
          </div>

        </div>
      )}
    </div>
  );
}

