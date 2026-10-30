import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileImage, 
  Video, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  RotateCcw,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

const SAMPLE_PRESETS = [
  {
    name: 'Industrial Weld Defect',
    domain: 'Industrial Manufacturing: Weld Cracks & Seam Flaws',
    description: 'High-stress alloy weld seam with microscopic fractures and porosity.',
    svgType: 'weld'
  },
  {
    name: 'PPE Safety Compliance',
    domain: 'Infrastructure & Safety: PPE & Hazard Verification',
    description: 'Construction personnel scan checking hard hat, vest, and harness.',
    svgType: 'safety'
  },
  {
    name: 'Retail Shelf Planogram',
    domain: 'Retail & Inventory: Stock Depletion & Facing Compliance',
    description: 'Supermarket beverage tier audit assessing out-of-stock gaps.',
    svgType: 'retail'
  }
];

export default function FileUploadZone({ 
  onAssetSelected, 
  selectedAsset, 
  onClear, 
  domain, 
  setDomain, 
  threshold, 
  setThreshold, 
  isAnalyzing,
  onRunAnalysis 
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Validate and read file
  const processFile = (file) => {
    setErrorMsg('');
    if (!file) return;

    // Check size <= 20MB
    const maxBytes = 20 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMsg('File exceeds 20MB limit. Please upload a smaller image or compressed frame.');
      return;
    }

    // Handle Image
    if (file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onAssetSelected({
          type: 'image',
          mimeType: file.type || 'image/jpeg',
          base64: e.target.result,
          name: file.name,
          sizeMb: (file.size / (1024 * 1024)).toFixed(2)
        });
      };
      reader.readAsDataURL(file);
      return;
    }

    // Handle Video: Extract first clear frame using HTML5 video canvas
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      video.src = URL.createObjectURL(file);

      video.onloadeddata = () => {
        video.currentTime = Math.min(0.5, video.duration / 2);
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frameDataUrl = canvas.toDataURL('image/jpeg', 0.92);

        onAssetSelected({
          type: 'video_frame',
          mimeType: 'image/jpeg',
          base64: frameDataUrl,
          name: `${file.name} (Extracted Frame)`,
          sizeMb: (file.size / (1024 * 1024)).toFixed(2)
        });
        URL.revokeObjectURL(video.src);
      };

      video.onerror = () => {
        setErrorMsg('Could not decode video file. Please upload an image directly.');
      };
      return;
    }

    setErrorMsg('Unsupported format. Please upload JPG, PNG, WebP, or MP4/WebM video.');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Generate synthetic high-res sample images using Canvas for instant testing
  const loadPreset = (preset) => {
    setDomain(preset.domain);
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    if (preset.svgType === 'weld') {
      // Dark industrial metal background
      const grad = ctx.createLinearGradient(0, 0, 1200, 800);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(0.5, '#334155');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 800);

      // Steel plate weld seam
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 24;
      ctx.beginPath();
      ctx.moveTo(350, 100);
      ctx.lineTo(850, 700);
      ctx.stroke();

      // Flaw crack
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(560, 360);
      ctx.lineTo(600, 420);
      ctx.lineTo(640, 440);
      ctx.stroke();

      // Text label on specimen
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('ALLOY SPECIMEN #304-B [WELD LINE DEFECT TEST]', 60, 70);
    } else if (preset.svgType === 'safety') {
      // Construction site hazard gradient
      const grad = ctx.createLinearGradient(0, 0, 1200, 800);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 800);

      // Scaffolding lines
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 8;
      ctx.strokeRect(200, 150, 800, 550);
      ctx.strokeRect(300, 250, 600, 350);

      // Personnel silhouette
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(580, 280, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(540, 340, 80, 180);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('INFRASTRUCTURE SAFETY CCTV FEED - ZONE 04', 60, 70);
    } else {
      // Retail supermarket shelf
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, 0, 1200, 800);

      // Shelf lines
      ctx.fillStyle = '#475569';
      ctx.fillRect(100, 250, 1000, 20);
      ctx.fillRect(100, 520, 1000, 20);

      // Retail items on shelf
      ctx.fillStyle = '#0284c7';
      for (let x = 140; x < 500; x += 70) {
        ctx.fillRect(x, 150, 50, 100);
      }
      // Missing gap
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(520, 150, 200, 100);
      ctx.setLineDash([]);

      ctx.fillStyle = '#0284c7';
      for (let x = 740; x < 1050; x += 70) {
        ctx.fillRect(x, 150, 50, 100);
      }

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('RETAIL PLANOGRAM AUDIT - AISLE 03 TIER 02', 60, 70);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    onAssetSelected({
      type: 'sample_preset',
      mimeType: 'image/jpeg',
      base64: dataUrl,
      name: `${preset.name}.jpg`,
      sizeMb: '0.85'
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-base">Visual Ingestion Engine</h3>
            <p className="text-xs text-slate-400">High-res images (.jpg, .png, .webp) & video frame capture</p>
          </div>
        </div>

        {selectedAsset && (
          <button
            onClick={onClear}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Asset</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Dropzone */}
      {!selectedAsset ? (
        <div>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 group ${
              isDragOver
                ? 'border-brand-400 bg-brand-500/10 scale-[1.01]'
                : 'border-slate-700/80 hover:border-brand-500/60 bg-slate-950/40 hover:bg-slate-800/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => processFile(e.target.files[0])}
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
              className="hidden"
            />
            
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-brand-400 group-hover:scale-110 transition-all border border-slate-700 shadow-inner">
              <UploadCloud className="w-7 h-7" />
            </div>

            <p className="text-sm font-medium text-slate-200 mb-1">
              Drag & drop visual assets here, or <span className="text-brand-400 underline decoration-brand-500/40 underline-offset-4">browse files</span>
            </p>
            <p className="text-xs text-slate-500 font-mono">
              Supports JPEG, PNG, WebP or MP4 video (up to 20MB)
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Or Load Industrial Test Presets</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => loadPreset(p)}
                  className="text-left p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/70 hover:border-brand-500/40 transition-colors text-xs group"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-brand-300 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-slate-400" />
                    <span>{p.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{p.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Preview Banner */
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
              <img 
                src={selectedAsset.base64} 
                alt="Selected asset preview" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{selectedAsset.name}</p>
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                <span className="uppercase">{selectedAsset.mimeType.split('/')[1]}</span>
                <span>•</span>
                <span>{selectedAsset.sizeMb} MB</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Controls */}
      <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Domain selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Inspection Domain Profile
          </label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          >
            <option value="Industrial Manufacturing: Weld Cracks & Seam Flaws">
              Industrial Manufacturing: Surface Cracks & Weld Porosity
            </option>
            <option value="Infrastructure & Safety: PPE & Hazard Verification">
              Infrastructure & Safety: Structural Corrosion & PPE Compliance
            </option>
            <option value="Retail & Inventory: Stock Depletion & Facing Compliance">
              Retail & Inventory: Shelf Stock Out & Planogram Audit
            </option>
            <option value="General Quality Control & Automated Assembly Verification">
              General Quality Control: Assembly & Component Verification
            </option>
          </select>
        </div>

        {/* Sensitivity slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-brand-400" />
              <span>Sensitivity Threshold</span>
            </label>
            <span className="text-xs font-mono font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
              {threshold}%
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            step="1"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full accent-brand-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>50% (High Recall)</span>
            <span>75% (Balanced)</span>
            <span>95% (High Precision)</span>
          </div>
        </div>
      </div>

      {/* Run Analysis Trigger */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onRunAnalysis}
          disabled={!selectedAsset || isAnalyzing}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg ${
            !selectedAsset || isAnalyzing
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : 'bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-white shadow-brand-500/25 hover:scale-[1.02]'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Processing Multi-Modal Inspection...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Execute AI Inspection</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

