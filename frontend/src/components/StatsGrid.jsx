import React from 'react';
import { Focus, Sun, Volume2, ShieldAlert } from 'lucide-react';

export default function StatsGrid({ cvMetrics }) {
  if (!cvMetrics) return null;

  const sharpness = cvMetrics.sharpness || {};
  const exposure = cvMetrics.exposure || {};
  const noise = cvMetrics.noise || {};
  const corruption = cvMetrics.corruption || {};
  const defects = cvMetrics.defects || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="clean-panel p-4 space-y-3 bg-white">
        <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
          <Focus className="w-4 h-4" />
          <span>Sharpness & Blur Metrics</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <div className="text-slate-500 font-medium">Laplacian Variance</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{sharpness.laplacian_var}</div>
            <div className="text-[10px] text-slate-400">&gt; 110 threshold</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <div className="text-slate-500 font-medium">Tenengrad Index</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{sharpness.tenengrad_index}</div>
            <div className="text-[10px] text-slate-400">Gradient magnitude</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <div className="text-slate-500 font-medium">FFT High-Freq Ratio</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{sharpness.fft_hf_ratio}</div>
            <div className="text-[10px] text-slate-400">Frequency power ratio</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <div className="text-slate-500 font-medium">Sharpness Score</div>
            <div className="text-sm font-bold text-indigo-600 mt-0.5">{sharpness.sharpness_score} / 100</div>
            <div className="text-[10px] text-slate-400">Normalized index</div>
          </div>
        </div>
      </div>

      <div className="clean-panel p-4 space-y-3 bg-white">
        <div className="flex items-center space-x-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
          <Sun className="w-4 h-4" />
          <span>Exposure & Luminance</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <div className="text-slate-500 font-medium">Mean Luminance</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{exposure.mean_luminance}</div>
            <div className="text-[10px] text-slate-400">LAB L-channel mean</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <div className="text-slate-500 font-medium">Shadow Clipping</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{exposure.shadow_clipping_pct}%</div>
            <div className="text-[10px] text-slate-400">Luminance &lt; 15</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <div className="text-slate-500 font-medium">Highlight Clipping</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{exposure.highlight_clipping_pct}%</div>
            <div className="text-[10px] text-slate-400">Luminance &gt; 240</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <div className="text-slate-500 font-medium">Dynamic Range</div>
            <div className="text-sm font-bold text-amber-600 mt-0.5">{exposure.dynamic_range}</div>
            <div className="text-[10px] text-slate-400">P99 - P1 spread</div>
          </div>
        </div>
      </div>

      <div className="clean-panel p-4 space-y-3 bg-white">
        <div className="flex items-center space-x-2 text-sky-600 font-bold text-xs uppercase tracking-wider">
          <Volume2 className="w-4 h-4" />
          <span>Noise & Signal Metrics</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <div className="text-slate-500 font-medium">Residual Noise Std</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{noise.noise_std}</div>
            <div className="text-[10px] text-slate-400">Median residual std</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <div className="text-slate-500 font-medium">Signal-to-Noise (SNR)</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{noise.snr_db} dB</div>
            <div className="text-[10px] text-slate-400">&gt; 25 dB is clean</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <div className="text-slate-500 font-medium">High-Freq Noise</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{noise.hf_noise_energy}</div>
            <div className="text-[10px] text-slate-400">Laplacian residual</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <div className="text-slate-500 font-medium">Noise Score</div>
            <div className="text-sm font-bold text-sky-600 mt-0.5">{noise.noise_score} / 100</div>
            <div className="text-[10px] text-slate-400">Normalized score</div>
          </div>
        </div>
      </div>

      <div className="clean-panel p-4 space-y-3 bg-white">
        <div className="flex items-center space-x-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>Surface Defects & Structure</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <div className="text-slate-500 font-medium">Defect Regions</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{defects.defect_count} regions</div>
            <div className="text-[10px] text-slate-400">Scratches / dust spots</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <div className="text-slate-500 font-medium">Defect Area Coverage</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{defects.defect_area_pct}%</div>
            <div className="text-[10px] text-slate-400">Surface anomaly %</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <div className="text-slate-500 font-medium">Shannon Entropy</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{corruption.entropy}</div>
            <div className="text-[10px] text-slate-400">Normal range 4.0 - 7.5</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <div className="text-slate-500 font-medium">Blockiness Index</div>
            <div className="text-sm font-bold text-rose-600 mt-0.5">{corruption.blockiness_index}</div>
            <div className="text-[10px] text-slate-400">&gt; 4.5 indicates blockiness</div>
          </div>
        </div>
      </div>
    </div>
  );
}
