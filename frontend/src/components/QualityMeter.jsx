import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function QualityMeter({ score, label }) {
  // Score colors & styling
  let strokeColor = '#10b981'; // Emerald (Acceptable)
  let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-emerald';
  let Icon = CheckCircle2;

  if (label === 'DEGRADED') {
    strokeColor = '#f59e0b'; // Amber
    badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/30 glow-amber';
    Icon = AlertTriangle;
  } else if (label === 'DEFECTIVE') {
    strokeColor = '#f43f5e'; // Crimson
    badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/30 glow-rose';
    Icon = AlertOctagon;
  }

  // SVG Gauge stroke parameters
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      
      {/* Circular Gauge */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            className="text-slate-800"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={strokeColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score Text */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold text-slate-100 tracking-tighter">
            {score}
          </span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
            / 100 Score
          </span>
        </div>
      </div>

      {/* Quality Label Badge */}
      <div className={`mt-4 px-4 py-1.5 rounded-full border flex items-center space-x-2 text-sm font-bold tracking-wide uppercase ${badgeBg}`}>
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>

    </div>
  );
}
