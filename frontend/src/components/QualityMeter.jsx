import React from 'react';

export default function QualityMeter({ score, label }) {
  let strokeColor = '#059669';
  let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (label === 'DEGRADED') {
    strokeColor = '#d97706';
    badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (label === 'DEFECTIVE') {
    strokeColor = '#e11d48';
    badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            className="text-slate-200"
            fill="transparent"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-slate-900">
            {score}
          </span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Score / 100
          </span>
        </div>
      </div>

      <div className={`mt-3 px-3 py-1 rounded border text-xs font-semibold tracking-wider uppercase ${badgeClass}`}>
        {label}
      </div>
    </div>
  );
}
