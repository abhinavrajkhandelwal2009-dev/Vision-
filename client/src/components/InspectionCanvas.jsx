import React, { useState, useRef } from 'react';
import { 
  Eye, 
  EyeOff, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers,
  Crosshair,
  AlertTriangle
} from 'lucide-react';

export default function InspectionCanvas({ 
  imageUrl, 
  anomalies = [], 
  selectedAnomalyId, 
  onSelectAnomaly 
}) {
  const [showOverlays, setShowOverlays] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredAnomalyId, setHoveredAnomalyId] = useState(null);
  const containerRef = useRef(null);

  const getSeverityColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return {
          border: 'border-red-500',
          bg: 'bg-red-500/20',
          text: 'text-red-400',
          badge: 'bg-red-950/80 text-red-300 border-red-700/60',
          hex: '#ef4444'
        };
      case 'HIGH':
        return {
          border: 'border-orange-500',
          bg: 'bg-orange-500/20',
          text: 'text-orange-400',
          badge: 'bg-orange-950/80 text-orange-300 border-orange-700/60',
          hex: '#f97316'
        };
      case 'MEDIUM':
        return {
          border: 'border-amber-400',
          bg: 'bg-amber-400/20',
          text: 'text-amber-400',
          badge: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
          hex: '#f59e0b'
        };
      case 'LOW':
      default:
        return {
          border: 'border-sky-400',
          bg: 'bg-sky-400/20',
          text: 'text-sky-400',
          badge: 'bg-sky-950/80 text-sky-300 border-sky-700/60',
          hex: '#38bdf8'
        };
    }
  };

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.min(2.5, Math.max(0.75, prev + delta)));
  };

  const resetZoom = () => setZoomLevel(1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Canvas Toolbar */}
      <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Interactive Annotation Canvas
          </span>
          <span className="text-xs font-mono text-slate-500">
            ({anomalies.length} {anomalies.length === 1 ? 'Anomaly' : 'Anomalies'} Detected)
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border transition-colors ${
              showOverlays 
                ? 'bg-brand-500/10 text-brand-300 border-brand-500/30' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle Bounding Overlays"
          >
            {showOverlays ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showOverlays ? 'Overlays On' : 'Overlays Off'}</span>
          </button>

          <div className="flex items-center bg-slate-800/80 rounded-lg border border-slate-700 p-0.5">
            <button
              onClick={() => handleZoom(-0.25)}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.25)}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetZoom}
              className="p-1 text-slate-400 hover:text-white rounded border-l border-slate-700 transition-colors ml-0.5"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Image Area with Relative Bounding Box Overlays */}
      <div 
        ref={containerRef}
        className="relative bg-slate-950 flex items-center justify-center overflow-auto p-4 min-h-[460px] max-h-[640px]"
      >
        <div 
          className="relative inline-block transition-transform duration-200 select-none shadow-2xl rounded-lg overflow-hidden"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          {/* Base Image */}
          <img
            src={imageUrl}
            alt="Inspection Target"
            className="max-h-[560px] w-auto max-w-full block object-contain pointer-events-none"
          />

          {/* Overlaid Bounding Boxes */}
          {showOverlays && anomalies.map((anomaly, index) => {
            const bb = anomaly.boundingBox || { ymin: 200, xmin: 200, ymax: 500, xmax: 500 };
            const top = (bb.ymin / 1000) * 100;
            const left = (bb.xmin / 1000) * 100;
            const height = Math.max(4, ((bb.ymax - bb.ymin) / 1000) * 100);
            const width = Math.max(4, ((bb.xmax - bb.xmin) / 1000) * 100);

            const isSelected = selectedAnomalyId === (anomaly.id || `anom-${index + 1}`);
            const isHovered = hoveredAnomalyId === (anomaly.id || `anom-${index + 1}`);
            const colors = getSeverityColor(anomaly.severity);

            return (
              <div
                key={anomaly.id || index}
                onClick={() => onSelectAnomaly && onSelectAnomaly(anomaly.id || `anom-${index + 1}`)}
                onMouseEnter={() => setHoveredAnomalyId(anomaly.id || `anom-${index + 1}`)}
                onMouseLeave={() => setHoveredAnomalyId(null)}
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                  height: `${height}%`,
                  width: `${width}%`
                }}
                className={`absolute border-2 cursor-pointer transition-all duration-150 group z-20 ${
                  colors.border
                } ${colors.bg} ${
                  isSelected || isHovered
                    ? 'ring-4 ring-white/60 shadow-lg scale-[1.01]'
                    : 'hover:border-white'
                }`}
              >
                {/* Crosshairs at box corners */}
                <span className="absolute -top-1 -left-1 w-2 h-2 bg-white rounded-full"></span>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"></span>
                <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-white rounded-full"></span>
                <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-white rounded-full"></span>

                {/* Floating Tag Indicator */}
                <div 
                  className={`absolute -top-7 left-0 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider border shadow-md flex items-center space-x-1.5 transition-opacity ${
                    colors.badge
                  } ${isSelected || isHovered ? 'opacity-100 z-30' : 'opacity-90'}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                  <span>#{index + 1} {anomaly.title}</span>
                  <span className="text-[9px] uppercase px-1 rounded bg-black/40">
                    {anomaly.severity}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info Bar */}
      <div className="bg-slate-950/90 px-4 py-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="font-mono text-[11px] text-slate-500">COORDINATE SYSTEM: 0-1000 NORMALIZED</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-500"></span> Critical</span>
          <span className="flex items-center gap-1 text-orange-400"><span className="w-2 h-2 rounded-full bg-orange-500"></span> High</span>
          <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Medium</span>
          <span className="flex items-center gap-1 text-sky-400"><span className="w-2 h-2 rounded-full bg-sky-400"></span> Low</span>
        </div>
      </div>
    </div>
  );
}

