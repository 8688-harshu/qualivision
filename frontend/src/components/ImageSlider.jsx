import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, Eye } from 'lucide-react';
import { getFullImageUrl } from '../services/api';

export default function ImageSlider({ originalUrl, heatmapUrl }) {
  const fullOrigUrl = getFullImageUrl(originalUrl);
  const fullHeatmapUrl = getFullImageUrl(heatmapUrl);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    percentage = Math.max(15, Math.min(85, percentage));
    setSliderPosition(percentage);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };

    const handleTouchMove = (e) => {
      if (isDragging) {
        handleMove(e.touches[0].clientX);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="clean-panel p-4 space-y-3 bg-white">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-indigo-600" />
          <span>Dynamic Resizable Split View</span>
        </div>
        <div className="flex items-center space-x-4 text-slate-500 text-xs">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
            <span>Original ({Math.round(sliderPosition)}%)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            <span>Heatmap ({Math.round(100 - sliderPosition)}%)</span>
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-[380px] rounded-lg overflow-hidden select-none cursor-ew-resize border border-slate-200 bg-slate-950 flex touch-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div
          className="h-full relative overflow-hidden bg-slate-900 flex flex-col items-center justify-center p-2 border-r border-slate-800"
          style={{ width: `${sliderPosition}%` }}
        >
          <div className="absolute top-2 left-2 bg-slate-900/90 text-white px-2 py-0.5 rounded text-[10px] font-bold z-10 border border-slate-700">
            Original ({Math.round(sliderPosition)}%)
          </div>
          <img
            src={fullOrigUrl}
            alt="Original Upload"
            className="max-w-full max-h-full object-contain"
          />
        </div>

        <div
          className="absolute top-0 bottom-0 w-1 bg-indigo-600 cursor-ew-resize z-20"
          style={{ left: `calc(${sliderPosition}% - 2px)` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md border-2 border-white">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
        </div>

        <div
          className="h-full relative overflow-hidden bg-slate-900 flex flex-col items-center justify-center p-2"
          style={{ width: `${100 - sliderPosition}%` }}
        >
          <div className="absolute top-2 right-2 bg-slate-900/90 text-white px-2 py-0.5 rounded text-[10px] font-bold z-10 border border-slate-700">
            Heatmap ({Math.round(100 - sliderPosition)}%)
          </div>
          <img
            src={fullHeatmapUrl || fullOrigUrl}
            alt="Quality Degradation Heatmap Overlay"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>

      <p className="text-[11px] text-slate-500 text-center font-medium">
        Drag the center divider handle left or right to dynamically resize and compare both images.
      </p>
    </div>
  );
}
