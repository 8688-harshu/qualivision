import React, { useState, useEffect } from 'react';
import { Eye, Layers, BarChart2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchHealthStatus } from '../services/api';

export default function Navbar({ activeTab, setActiveTab }) {
  const [health, setHealth] = useState({ healthy: false, loading: true });

  const checkHealth = async () => {
    try {
      const data = await fetchHealthStatus();
      setHealth({ healthy: data.status === 'healthy', loading: false });
    } catch {
      setHealth({ healthy: false, loading: false });
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('evaluator')}>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <Eye className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              QualiVision AI
            </h1>
            <p className="text-xs text-slate-500 font-medium">Image Quality & Defect Evaluation</p>
          </div>
        </div>

        <nav className="flex space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('evaluator')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'evaluator'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Analysis Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>History</span>
          </button>

          <button
            onClick={() => setActiveTab('model')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'model'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Model Insights</span>
          </button>
        </nav>

        <div className="flex items-center space-x-2 text-xs">
          {health.loading ? (
            <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />
          ) : health.healthy ? (
            <div className="flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Engine Active</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Offline</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
