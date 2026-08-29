import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Eye, Calendar, HardDrive, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchAnalyses, deleteAnalysis, getFullImageUrl } from '../services/api';

export default function HistoryTable({ onSelectAnalysis }) {
  const [data, setData] = useState({ total: 0, page: 1, limit: 8, analyses: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [qualityLabel, setQualityLabel] = useState('');
  const [page, setPage] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchAnalyses(page, 8, qualityLabel, search);
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, qualityLabel]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this analysis record?')) {
      try {
        await deleteAnalysis(id);
        loadData();
      } catch (err) {
        alert('Failed to delete analysis');
      }
    }
  };

  const totalPages = Math.ceil(data.total / data.limit) || 1;

  const getLabelBadge = (label) => {
    switch (label) {
      case 'ACCEPTABLE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DEGRADED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DEFECTIVE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="clean-panel p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 bg-white">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
          />
        </form>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Label:</span>
          </div>

          <select
            value={qualityLabel}
            onChange={(e) => {
              setQualityLabel(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 font-medium"
          >
            <option value="">All Labels</option>
            <option value="ACCEPTABLE">Acceptable</option>
            <option value="DEGRADED">Degraded</option>
            <option value="DEFECTIVE">Defective</option>
          </select>

          <button
            onClick={loadData}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 text-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="clean-panel p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-2 bg-white">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
          <p className="text-xs font-medium">Loading analysis history...</p>
        </div>
      ) : data.analyses.length === 0 ? (
        <div className="clean-panel p-12 text-center text-slate-500 space-y-2 bg-white">
          <HardDrive className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">No Analysis History Found</h4>
          <p className="text-xs text-slate-500">Upload an image in the Analysis Hub to generate evaluation records.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data.analyses.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectAnalysis(item)}
              className="clean-card overflow-hidden border border-slate-200 hover:border-indigo-500 transition-all cursor-pointer flex flex-col justify-between bg-white shadow-sm"
            >
              <div>
                <div className="relative h-36 bg-slate-900 overflow-hidden border-b border-slate-200">
                  <img
                    src={getFullImageUrl(item.original_image_url)}
                    alt={item.filename}
                    className="w-full h-full object-cover"
                  />

                  <span
                    className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider shadow-sm ${getLabelBadge(
                      item.quality_label
                    )}`}
                  >
                    {item.quality_label}
                  </span>

                  <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-0.5 rounded border border-slate-200 text-[11px] font-bold text-indigo-600 shadow-sm">
                    Score: {item.quality_score}/100
                  </div>
                </div>

                <div className="p-3 space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs truncate" title={item.filename}>
                    {item.filename}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </span>
                    <span>{(item.file_size_bytes / 1024).toFixed(0)} KB</span>
                  </div>

                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-medium">
                    {item.issues?.length || 0} Issues Detected
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                <button className="text-indigo-600 font-semibold flex items-center space-x-1 hover:underline">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>

                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs text-slate-600 font-medium">
          <div>
            Page {data.page} of {totalPages} ({data.total} items)
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
