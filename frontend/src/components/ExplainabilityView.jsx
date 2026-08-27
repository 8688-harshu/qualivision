import React from 'react';
import { Cpu, Info, Check, AlertTriangle } from 'lucide-react';

export default function ExplainabilityView({ explainability }) {
  if (!explainability) return null;

  const factors = explainability.decision_factors || [];
  const modelConfidence = (explainability.model_confidence * 100).toFixed(0);

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
      
      {/* Header & Confidence */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Model Decision Explainability</h3>
            <p className="text-xs text-slate-400">Random Forest Classifier & Feature Weights</p>
          </div>
        </div>

        <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 flex items-center space-x-3">
          <span className="text-xs text-slate-400 font-medium">Model Certainty:</span>
          <span className="text-sm font-extrabold text-cyan-400">{modelConfidence}%</span>
        </div>
      </div>

      {/* Decision Factors */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Extracted Feature Scores & Weighted Decision Impact
        </div>

        <div className="space-y-3">
          {factors.map((item, idx) => (
            <div key={idx} className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 font-semibold text-slate-200">
                  {item.impact === 'negative' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Check className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>{item.factor}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-slate-400 text-[11px]">Weight: {(item.weight * 100).toFixed(0)}%</span>
                  <span className={`font-bold ${item.impact === 'negative' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {item.score} / 100
                  </span>
                </div>
              </div>

              {/* Progress score bar */}
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.impact === 'negative'
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                  }`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start space-x-2 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          The decision model integrates 22 low-level computer vision metrics (gradient magnitudes, luminance percentiles, noise variance estimate, contour aspect ratios) with an ensemble classifier trained on synthetic and clean baseline images.
        </p>
      </div>

    </div>
  );
}
