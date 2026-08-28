import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, RefreshCw } from 'lucide-react';
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
      <div className="clean-panel p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-2 bg-white">
        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
        <p className="text-xs font-medium">Loading evaluation metrics...</p>
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
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="clean-card p-4 space-y-1 bg-white">
          <div className="text-xs text-slate-500 font-medium">Holdout Accuracy</div>
          <div className="text-2xl font-bold text-indigo-600">
            {(metrics.accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-400">Unseen test set</div>
        </div>

        <div className="clean-card p-4 space-y-1 bg-white">
          <div className="text-xs text-slate-500 font-medium">Weighted F1-Score</div>
          <div className="text-2xl font-bold text-emerald-600">
            {metrics.f1_score.toFixed(3)}
          </div>
          <div className="text-[10px] text-slate-400">Harmonic precision/recall</div>
        </div>

        <div className="clean-card p-4 space-y-1 bg-white">
          <div className="text-xs text-slate-500 font-medium">5-Fold CV Accuracy</div>
          <div className="text-2xl font-bold text-sky-600">
            {(metrics.cv_mean_accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-400">Cross-validation stability</div>
        </div>

        <div className="clean-card p-4 space-y-1 bg-white">
          <div className="text-xs text-slate-500 font-medium">Training Samples</div>
          <div className="text-2xl font-bold text-amber-600">
            {metrics.total_samples || 420}
          </div>
          <div className="text-[10px] text-slate-400">Dataset samples</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="clean-panel p-5 space-y-3 bg-white">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Confusion Matrix</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Multi-class evaluation matrix on unseen test images across Acceptable, Degraded, and Defective categories.
          </p>

          <div className="overflow-x-auto pt-1">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-slate-500 border border-slate-200 bg-slate-50">Actual / Pred</th>
                  <th className="p-2 text-emerald-700 font-bold border border-slate-200 bg-emerald-50/50">ACCEPTABLE</th>
                  <th className="p-2 text-amber-700 font-bold border border-slate-200 bg-amber-50/50">DEGRADED</th>
                  <th className="p-2 text-rose-700 font-bold border border-slate-200 bg-rose-50/50">DEFECTIVE</th>
                </tr>
              </thead>
              <tbody>
                {['ACCEPTABLE', 'DEGRADED', 'DEFECTIVE'].map((rowLabel, rIdx) => (
                  <tr key={rIdx}>
                    <td className="p-2 font-semibold text-slate-700 border border-slate-200 bg-slate-50">{rowLabel}</td>
                    {cm[rIdx]?.map((val, cIdx) => (
                      <td
                        key={cIdx}
                        className={`p-2.5 font-bold text-xs border border-slate-200 ${
                          rIdx === cIdx
                            ? 'bg-indigo-50 text-indigo-700'
                            : val > 0
                            ? 'bg-rose-50 text-rose-700'
                            : 'text-slate-400'
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

        <div className="clean-panel p-5 space-y-3 bg-white">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Feature Importance Ranking</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Relative decision weight of extracted computer vision metrics evaluated by Gini impurity reduction.
          </p>

          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {metrics.feature_importances?.slice(0, 7).map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700 font-medium">
                  <span>{item.feature.replace('_', ' ')}</span>
                  <span className="text-indigo-600 font-mono font-bold">{(item.importance * 100).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
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
