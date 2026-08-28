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

export default function App() {
  const [activeTab, setActiveTab] = useState('evaluator');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeViewTab, setActiveViewTab] = useState('slider');

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
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');

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

      ctx.font = '18px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Preset: ${presetKey.toUpperCase()}`, 30, 370);

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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg flex items-center justify-between text-xs font-medium">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-semibold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {activeTab === 'evaluator' && (
          <div className="space-y-6">
            <UploadZone
              onFileSelected={handleFileSelected}
              isLoading={isLoading}
              onSelectPreset={handleSelectPreset}
            />

            {isLoading && (
              <div className="clean-panel p-10 text-center flex flex-col items-center justify-center space-y-3 bg-white">
                <div className="w-10 h-10 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Evaluating Image Quality</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Extracting sharpness, exposure, noise, surface defect metrics, and ML inference...
                  </p>
                </div>
              </div>
            )}

            {analysisResult && !isLoading && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="clean-panel p-5 flex flex-col items-center justify-center border border-slate-200 bg-white">
                    <QualityMeter
                      score={analysisResult.quality_score}
                      label={analysisResult.quality_label}
                    />

                    <div className="w-full pt-3 mt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between font-medium">
                      <span>File: <strong className="text-slate-900">{analysisResult.filename}</strong></span>
                      <span>{analysisResult.width}x{analysisResult.height} px</span>
                    </div>
                  </div>

                  <div className="lg:col-span-2 clean-panel p-5 border border-slate-200 bg-white">
                    <IssueList issues={analysisResult.issues} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex space-x-1 bg-slate-200/80 p-1 rounded-lg border border-slate-300/60 max-w-md">
                    <button
                      onClick={() => setActiveViewTab('slider')}
                      className={`flex-1 py-1.5 rounded text-xs font-semibold transition-colors ${
                        activeViewTab === 'slider'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Heatmap Comparison
                    </button>

                    <button
                      onClick={() => setActiveViewTab('stats')}
                      className={`flex-1 py-1.5 rounded text-xs font-semibold transition-colors ${
                        activeViewTab === 'stats'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Quantitative Stats
                    </button>

                    <button
                      onClick={() => setActiveViewTab('explain')}
                      className={`flex-1 py-1.5 rounded text-xs font-semibold transition-colors ${
                        activeViewTab === 'explain'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Model Explainability
                    </button>
                  </div>

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

        {activeTab === 'history' && (
          <HistoryTable onSelectAnalysis={handleSelectHistoryItem} />
        )}

        {activeTab === 'model' && (
          <ModelMetricsView />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 font-medium">
          QualiVision AI - Automated Computer Vision & Machine Learning Image Quality Evaluation
        </div>
      </footer>
    </div>
  );
}
