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
      
      {/* 1. Sharpness Card */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
          <Focus className="w-4 h-4" />
          <span>Sharpness & Blur Metrics</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">Laplacian Variance</div>
            <div className="text-sm font-bold text-slate-100 mt-0.5">{sharpness.laplacian_var}</div>
            <div className="text-[10px] text-slate-500">&gt; 110 is sharp</div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">Tenengrad Index</div>
            <div className="text-sm font-bold text-slate-100 mt-0.5">{sharpness.tenengrad_index}</div>
            <div className="text-[10px] text-slate-500">Gradient magnitude</div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">FFT High-Freq Ratio</div>
            <div className="text-sm font-bold text-slate-100 mt-0.5">{sharpness.fft_hf_ratio}</div>
            <div className="text-[10px] text-slate-500">Frequency power ratio</div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">Sharpness Subscore</div>
            <div className="text-sm font-bold text-cyan-400 mt-0.5">{sharpness.sharpness_score} / 100</div>
            <div className="text-[10px] text-slate-500">Normalized index</div>
          </div>
        </div>
      </div>

      {/* 2. Exposure & Contrast Card */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
          <Sun className="w-4 h-4" />
          <span>Exposure & Luminance</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">Mean Luminance</div>
            <div className="text-sm font-bold text-slate-100 mt-0.5">{exposure.mean_luminance}</div>
            <div className="text-[10px] text-slate-500">LAB L-channel mean</div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">Shadow Clipping</div>
            <div className="text-sm font-bold text-slate-100 mt-0.5">{exposure.shadow_clipping_pct}%</div>
            <div className="text-[10px] text-slate-500">Luminance &lt; 15</div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">Highlight Clipping</div>
            <div className="text-sm font-bold text-slate-100 mt-0.5">{exposure.highlight_clipping_pct}%</div>
            <div className="text-[10px] text-slate-500">Luminance &gt; 240</div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">Dynamic Range</div>
            <div className="text-sm font-bold text-amber-400 mt-0.5">{exposure.dynamic_range}</div>
            <div className="text-[10px] text-slate-500">P99 - P1 spread</div>
          </div>
        </div>
      </div>

      {/* 3. Noise & Signal Ratio Card */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2 text-purple-400 font-semibold text-sm">
          <Volume2 className="w-4 h-4" />
          <span>Noise & Signal-to-Noise</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">Residual Noise Std</div>
            <div className="text-sm font-bold text-slate-100 mt-0.5">{noise.noise_std}</div>
            <div className="text-[10px] text-slate-500">Median diff std dev</div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">Signal-to-Noise (SNR)</div>
            <div className="text-sm font-bold text-slate-100 mt-0.5">{noise.snr_db} dB</div>
            <div className="text-[10px] text-slate-500">&gt; 25 dB is clean</div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">High-Freq Noise Energy</div>
            <div className="text-sm font-bold text-slate-100 mt-0.5">{noise.hf_noise_energy}</div>
            <div className="text-[10px] text-slate-500">Laplacian residual</div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">Noise Subscore</div>
            <div className="text-sm font-bold text-purple-400 mt-0.5">{noise.noise_score} / 100</div>
            <div className="text-[10px] text-slate-500">Normalized cleanliness</div>
          </div>
        </div>
      </div>

      {/* 4. Defects & Structure Card */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2 text-rose-400 font-semibold text-sm">
          <ShieldAlert className="w-4 h-4" />
          <span>Surface Defects & Structure</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">Defect Region Count</div>
            <div className="text-sm font-bold text-slate-100 mt-0.5">{defects.defect_count} regions</div>
            <div className="text-[10px] text-slate-500">Scratches / dust spots</div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">Defect Area Coverage</div>
            <div className="text-sm font-bold text-slate-100 mt-0.5">{defects.defect_area_pct}%</div>
            <div className="text-[10px] text-slate-500">Surface anomaly %</div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">Shannon Entropy</div>
            <div className="text-sm font-bold text-slate-100 mt-0.5">{corruption.entropy}</div>
            <div className="text-[10px] text-slate-500">Normal range 4.0 - 7.5</div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-slate-400">JPEG Blockiness Index</div>
            <div className="text-sm font-bold text-rose-400 mt-0.5">{corruption.blockiness_index}</div>
            <div className="text-[10px] text-slate-500">&gt; 4.5 indicates corruption</div>
          </div>
        </div>
      </div>

    </div>
  );
}
