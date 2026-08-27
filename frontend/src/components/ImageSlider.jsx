import React, { useState, useRef } from 'react';
import { SlidersHorizontal, Eye, Flame } from 'lucide-react';

export default function ImageSlider({ originalUrl, heatmapUrl }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider px-1">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span>Visual Defect Overlay & Heatmap</span>
        </div>
        <div className="flex items-center space-x-4 text-slate-400 text-xs font-normal">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
            <span>Original</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            <span>Heatmap Overlay</span>
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-[380px] rounded-xl overflow-hidden select-none cursor-ew-resize border border-slate-800"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
      >
        {/* Underneath Layer: Quality Heatmap */}
        {heatmapUrl ? (
          <img
            src={heatmapUrl}
            alt="Quality Degradation Heatmap Overlay"
            className="absolute inset-0 w-full h-full object-contain bg-slate-950"
          />
        ) : (
          <img
            src={originalUrl}
            alt="Original Upload"
            className="absolute inset-0 w-full h-full object-contain bg-slate-950"
          />
        )}

        {/* Top Layer: Original Image (Clipped by slider position) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={originalUrl}
            alt="Original Upload"
            className="absolute inset-0 w-full h-full object-contain bg-slate-950"
            style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
          />
        </div>

        {/* Slider Handle Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-lg shadow-cyan-500/50 cursor-ew-resize"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-xl shadow-cyan-500/40">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
        </div>

        {/* Interactive Helper Pill */}
        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-800 text-[11px] text-slate-300 pointer-events-none">
          Drag handle to compare Original vs Defect Heatmap
        </div>
      </div>
    </div>
  );
}
