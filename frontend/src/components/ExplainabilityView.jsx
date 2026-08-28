import React from 'react';
import { Cpu, Info, Check, AlertTriangle } from 'lucide-react';

export default function ExplainabilityView({ explainability }) {
  if (!explainability) return null;

  const factors = explainability.decision_factors || [];
  const modelConfidence = (explainability.model_confidence * 100).toFixed(0);

  return (
    <div className="clean-panel p-5 space-y-4 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Decision Explainability</h3>
            <p className="text-xs text-slate-500 font-medium">Random Forest Classifier & Feature Weights</p>
          </div>
        </div>

        <div className="bg-slate-50 px-3 py-1.5 rounded border border-slate-200 flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Model Certainty:</span>
          <span className="text-xs font-bold text-indigo-600">{modelConfidence}%</span>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Extracted Feature Scores & Decision Weights
        </div>

        <div className="space-y-2">
          {factors.map((item, idx) => (
            <div key={idx} className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 font-semibold text-slate-800">
                  {item.impact === 'negative' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>{item.factor}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-slate-500 text-[11px]">Weight: {(item.weight * 100).toFixed(0)}%</span>
                  <span className={`font-bold ${item.impact === 'negative' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {item.score} / 100
                  </span>
                </div>
              </div>

              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    item.impact === 'negative'
                      ? 'bg-rose-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start space-x-2 bg-indigo-50/60 p-3 rounded border border-indigo-100 text-xs text-indigo-900">
        <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          The decision model integrates 22 low-level computer vision metrics (gradient magnitudes, luminance percentiles, noise variance estimate, contour aspect ratios) with an ensemble classifier trained on synthetic and clean baseline images.
        </p>
      </div>
    </div>
  );
}
