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
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('evaluator')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Eye className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 tracking-tight">
              QualiVision <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 ml-1">AI CV v1.0</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Automated Visual Quality & Defect Evaluation</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('evaluator')}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'evaluator'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-semibold shadow-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Analysis Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'history'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-semibold shadow-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Analysis History</span>
          </button>

          <button
            onClick={() => setActiveTab('model')}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === 'model'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-semibold shadow-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Model Insights</span>
          </button>
        </nav>

        {/* Operational Health Badge */}
        <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
          {health.loading ? (
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          ) : health.healthy ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">CV/ML Engine Active</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-rose-400 font-medium">Backend Offline</span>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
