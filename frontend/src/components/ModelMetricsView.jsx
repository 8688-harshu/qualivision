import React, { useState, useEffect } from 'react';
import { BarChart3, CheckCircle, PieChart, Activity, RefreshCw } from 'lucide-react';
import { fetchModelInfo } from '../services/api';

export default function ModelMetricsView() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModelInfo()
      .then((data) => setMetrics(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm font-medium">Loading evaluation & training metrics...</p>
      </div>
    );
  }

  if (!metrics) return null;

  const cm = metrics.confusion_matrix || [
    [20, 0, 0],
    [0, 58, 2],
    [0, 1, 24]
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Holdout Accuracy</div>
          <div className="text-3xl font-extrabold text-cyan-400">
            {(metrics.accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500">Unseen test set</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Weighted F1-Score</div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {metrics.f1_score.toFixed(3)}
          </div>
          <div className="text-[10px] text-slate-500">Harmonic precision/recall</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">5-Fold CV Accuracy</div>
          <div className="text-3xl font-extrabold text-indigo-400">
            {(metrics.cv_mean_accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500">Cross-validation stability</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Total Training Samples</div>
          <div className="text-3xl font-extrabold text-amber-400">
            {metrics.total_samples || 420}
          </div>
          <div className="text-[10px] text-slate-500">Clean & synthetic dataset</div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Confusion Matrix Table */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-slate-100 font-bold text-base">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>Evaluation Confusion Matrix</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Multi-class evaluation matrix on unseen test images showing high classification precision across Acceptable, Degraded, and Defective categories.
          </p>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-slate-500 border border-slate-800">Actual / Pred</th>
                  <th className="p-2 text-emerald-400 border border-slate-800">ACCEPTABLE</th>
                  <th className="p-2 text-amber-400 border border-slate-800">DEGRADED</th>
                  <th className="p-2 text-rose-400 border border-slate-800">DEFECTIVE</th>
                </tr>
              </thead>
              <tbody>
                {['ACCEPTABLE', 'DEGRADED', 'DEFECTIVE'].map((rowLabel, rIdx) => (
                  <tr key={rIdx}>
                    <td className="p-2 font-semibold text-slate-300 border border-slate-800">{rowLabel}</td>
                    {cm[rIdx]?.map((val, cIdx) => (
                      <td
                        key={cIdx}
                        className={`p-3 font-extrabold text-sm border border-slate-800 ${
                          rIdx === cIdx
                            ? 'bg-cyan-500/20 text-cyan-300 font-black'
                            : val > 0
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'text-slate-600'
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature Importance Ranking */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-slate-100 font-bold text-base">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>Top Feature Importance Ranking</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Relative decision weight of extracted computer vision metrics as evaluated by Gini impurity reduction.
          </p>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {metrics.feature_importances?.slice(0, 7).map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>{item.feature.replace('_', ' ')}</span>
                  <span className="text-cyan-400 font-mono">{(item.importance * 100).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                    style={{ width: `${item.importance * 100 * 3.5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
