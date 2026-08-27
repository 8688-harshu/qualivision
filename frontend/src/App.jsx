import React, { useState } from 'react';
import Navbar from './components/Navbar';
import UploadZone from './components/UploadZone';
import QualityMeter from './components/QualityMeter';
import IssueList from './components/IssueList';
import ImageSlider from './components/ImageSlider';
import StatsGrid from './components/StatsGrid';
import ExplainabilityView from './components/ExplainabilityView';
import HistoryTable from './components/HistoryTable';
import ModelMetricsView from './components/ModelMetricsView';
import { analyzeImage } from './services/api';
import { RefreshCw, Sparkles, Layers, Sliders, ChevronRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('evaluator');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeViewTab, setActiveViewTab] = useState('slider'); // 'slider', 'stats', 'explain'

  const handleFileSelected = async (file) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyzeImage(file);
      setAnalysisResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Image quality evaluation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = async (presetKey) => {
    setIsLoading(true);
    setError(null);
    try {
      // Create synthetic canvas image matching preset for instant testing
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');

      // Draw background pattern
      const grad = ctx.createLinearGradient(0, 0, 0, 400);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#0284c7');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 500, 400);

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(180, 200, 70, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(280, 120, 140, 100);

      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`QualiVision Preset: ${presetKey.toUpperCase()}`, 30, 370);

      // Apply synthetic degradation based on key
      if (presetKey === 'blurry') {
        ctx.filter = 'blur(12px)';
        ctx.drawImage(canvas, 0, 0);
      } else if (presetKey === 'underexposed') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, 500, 400);
      } else if (presetKey === 'overexposed') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillRect(0, 0, 500, 400);
      } else if (presetKey === 'defective') {
        // Draw artificial scratches & dust spots
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(80, 80);
        ctx.lineTo(350, 320);
        ctx.stroke();

        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath();
        ctx.arc(240, 160, 15, 0, Math.PI * 2);
        ctx.fill();
      }

      canvas.toBlob(async (blob) => {
        const file = new File([blob], `preset_${presetKey}.jpg`, { type: 'image/jpeg' });
        await handleFileSelected(file);
      }, 'image/jpeg');

    } catch (err) {
      setError(err.message || 'Preset evaluation failed');
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item) => {
    setAnalysisResult(item);
    setActiveTab('evaluator');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      
      {/* Header Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl flex items-center justify-between text-sm">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-xs font-semibold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Analysis Hub */}
        {activeTab === 'evaluator' && (
          <div className="space-y-8">
            
            {/* Upload Zone & Samples */}
            <UploadZone
              onFileSelected={handleFileSelected}
              isLoading={isLoading}
              onSelectPreset={handleSelectPreset}
            />

            {/* Analysis Loading Indicator */}
            {isLoading && (
              <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Evaluating Image Quality</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Extracting Laplacian sharpness, luminance clipping, noise residuals, defect contours & ML inference...
                  </p>
                </div>
              </div>
            )}

            {/* Analysis Dashboard Result */}
            {analysisResult && !isLoading && (
              <div className="space-y-6">
                
                {/* Top Banner: Score + Issue List */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Gauge Meter Panel */}
                  <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center border border-slate-800">
                    <QualityMeter
                      score={analysisResult.quality_score}
                      label={analysisResult.quality_label}
                    />

                    <div className="w-full pt-4 mt-2 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between px-2">
                      <span>Filename: <strong className="text-slate-200">{analysisResult.filename}</strong></span>
                      <span>{analysisResult.width}x{analysisResult.height} px</span>
                    </div>
                  </div>

                  {/* Issues List Panel */}
                  <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800">
                    <IssueList issues={analysisResult.issues} />
                  </div>

                </div>

                {/* Bottom View Switcher: Slider vs Stats vs Explainability */}
                <div className="space-y-4">
                  
                  {/* View Tab Selector */}
                  <div className="flex space-x-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 max-w-md">
                    <button
                      onClick={() => setActiveViewTab('slider')}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                        activeViewTab === 'slider'
                          ? 'bg-cyan-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Heatmap Comparison
                    </button>

                    <button
                      onClick={() => setActiveViewTab('stats')}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                        activeViewTab === 'stats'
                          ? 'bg-cyan-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Quantitative Stats
                    </button>

                    <button
                      onClick={() => setActiveViewTab('explain')}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                        activeViewTab === 'explain'
                          ? 'bg-cyan-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Model Explainability
                    </button>
                  </div>

                  {/* Tab Views */}
                  {activeViewTab === 'slider' && (
                    <ImageSlider
                      originalUrl={analysisResult.original_image_url}
                      heatmapUrl={analysisResult.heatmap_image_url}
                    />
                  )}

                  {activeViewTab === 'stats' && (
                    <StatsGrid cvMetrics={analysisResult.cv_metrics} />
                  )}

                  {activeViewTab === 'explain' && (
                    <ExplainabilityView explainability={analysisResult.explainability} />
                  )}

                </div>

              </div>
            )}

          </div>
        )}

        {/* Tab 2: Analysis History */}
        {activeTab === 'history' && (
          <HistoryTable onSelectAnalysis={handleSelectHistoryItem} />
        )}

        {/* Tab 3: Model Insights */}
        {activeTab === 'model' && (
          <ModelMetricsView />
        )}

      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-800/80 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          QualiVision AI &copy; 2026 - Automated Computer Vision & Machine Learning Image Quality Evaluation System
        </div>
      </footer>

    </div>
  );
}
