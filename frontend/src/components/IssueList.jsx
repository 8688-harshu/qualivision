import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function IssueList({ issues }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="clean-card p-5 flex flex-col items-center justify-center text-center space-y-2 bg-emerald-50/50 border-emerald-100">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        <h4 className="text-sm font-semibold text-emerald-900">No Issues Detected</h4>
        <p className="text-xs text-emerald-700">
          The image meets all visual sharpness, exposure, noise, and structural criteria.
        </p>
      </div>
    );
  }

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <span>Detected Quality Issues</span>
        <span>{issues.length} Issues</span>
      </div>

      <div className="space-y-2">
        {issues.map((issue, idx) => (
          <div
            key={idx}
            className="clean-card p-3.5 border border-slate-200 bg-white space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span className="font-semibold text-slate-800 capitalize text-xs">
                  {issue.type.replace('_', ' ')}
                </span>
              </div>

              <span
                className={`text-[10px] px-2 py-0.5 rounded border font-semibold uppercase ${getSeverityBadge(
                  issue.severity
                )}`}
              >
                {issue.severity}
              </span>
            </div>

            {issue.description && (
              <p className="text-xs text-slate-600 pl-6">
                {issue.description}
              </p>
            )}

            <div className="flex items-center space-x-3 text-xs text-slate-500 pl-6">
              <span className="w-24 text-[11px]">Confidence: {(issue.confidence * 100).toFixed(0)}%</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-indigo-600 rounded-full"
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
