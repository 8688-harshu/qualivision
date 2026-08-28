import React, { useState, useRef } from 'react';
import { Upload, FileCheck, Zap, Sliders } from 'lucide-react';

export default function UploadZone({ onFileSelected, isLoading, onSelectPreset }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
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
    onFileSelected(file);
  };

  const presets = [
    { key: 'acceptable', label: 'Clean Image' },
    { key: 'blurry', label: 'Blurry' },
    { key: 'underexposed', label: 'Underexposed' },
    { key: 'overexposed', label: 'Overexposed' },
    { key: 'noisy', label: 'High Noise' },
    { key: 'defective', label: 'Defective Surface' },
    { key: 'corrupt', label: 'Corrupted File' },
  ];

  return (
    <div className="space-y-4">
      <div
        className={`border border-dashed rounded-xl p-8 text-center transition-colors bg-white shadow-sm ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50/50'
            : 'border-slate-300 hover:border-indigo-400'
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

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            {isLoading ? (
              <Zap className="w-6 h-6 text-indigo-600 animate-pulse" />
            ) : selectedFile ? (
              <FileCheck className="w-6 h-6 text-emerald-600" />
            ) : (
              <Upload className="w-6 h-6 text-indigo-600" />
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              {isLoading
                ? 'Evaluating Image Metrics...'
                : selectedFile
                ? `Selected: ${selectedFile.name}`
                : 'Drag and drop an image, or browse from device'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports JPEG, PNG, WEBP, BMP up to 15MB.
            </p>
          </div>

          {!isLoading && (
            <button
              onClick={() => inputRef.current?.click()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
            >
              Select Image
            </button>
          )}
        </div>
      </div>

      <div className="clean-panel p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-600 font-medium">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <span>Quick Evaluation Presets:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.key}
              disabled={isLoading}
              onClick={() => onSelectPreset(preset.key)}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-medium transition-colors disabled:opacity-50"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
