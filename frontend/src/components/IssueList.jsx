import React from 'react';
import { AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function IssueList({ issues }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-2">
        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        <h4 className="text-base font-semibold text-slate-200">No Quality Issues Detected</h4>
        <p className="text-xs text-slate-400">
          The image satisfied all sharpness, exposure, noise, surface integrity, and decoding standards.
        </p>
      </div>
    );
  }

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
        <span>Detected Defects & Degradations</span>
        <span>{issues.length} Identified</span>
      </div>

      <div className="space-y-2.5">
        {issues.map((issue, idx) => (
          <div
            key={idx}
            className="glass-card rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-all duration-200 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span className="font-semibold text-slate-200 capitalize text-sm">
                  {issue.type.replace('_', ' ')}
                </span>
              </div>

              <span
                className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${getSeverityBadge(
                  issue.severity
                )}`}
              >
                {issue.severity}
              </span>
            </div>

            {issue.description && (
              <p className="text-xs text-slate-400 leading-relaxed pl-6">
                {issue.description}
              </p>
            )}

            {/* Confidence Bar */}
            <div className="pt-1 flex items-center space-x-3 text-xs text-slate-400 pl-6">
              <span className="w-24">Confidence: {(issue.confidence * 100).toFixed(0)}%</span>
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  style={{ width: `${issue.confidence * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
