import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, AlertCircle, FileCheck, Zap } from 'lucide-react';

export default function UploadZone({ onFileSelected, isLoading, onSelectPreset }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onFileSelected(file);
  };

  const presets = [
    { key: 'acceptable', label: 'Clean Image', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
    { key: 'blurry', label: 'Blurry Image', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
    { key: 'underexposed', label: 'Underexposed', color: 'border-slate-500/30 text-slate-300 bg-slate-500/10' },
    { key: 'overexposed', label: 'Overexposed', color: 'border-cyan-500/30 text-cyan-300 bg-cyan-500/10' },
    { key: 'noisy', label: 'High Noise', color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
    { key: 'defective', label: 'Defective Surface', color: 'border-rose-500/30 text-rose-400 bg-rose-500/10' },
    { key: 'corrupt', label: 'Corrupted File', color: 'border-red-500/40 text-red-400 bg-red-500/10' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Drag & Drop Card */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            {isLoading ? (
              <Zap className="w-8 h-8 text-cyan-400 animate-bounce" />
            ) : previewUrl ? (
              <FileCheck className="w-8 h-8 text-emerald-400" />
            ) : (
              <Upload className="w-8 h-8 text-cyan-400" />
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              {isLoading
                ? 'Evaluating Visual Quality & Defect Metrics...'
                : selectedFile
                ? `Selected: ${selectedFile.name}`
                : 'Drag & Drop an image here or click to browse'}
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Supports JPEG, PNG, WEBP, BMP up to 15MB. Evaluated strictly via local CV & ML.
            </p>
          </div>

          {!isLoading && (
            <button
              onClick={() => inputRef.current?.click()}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-cyan-500/25"
            >
              Select Local File
            </button>
          )}

        </div>
      </div>

      {/* Preset Test Images Bar */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Quick Evaluation Test Presets:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.key}
              disabled={isLoading}
              onClick={() => onSelectPreset(preset.key)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 hover:scale-105 ${preset.color} disabled:opacity-50`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
