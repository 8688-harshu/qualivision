import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Eye, Calendar, HardDrive, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchAnalyses, deleteAnalysis } from '../services/api';

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
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'DEGRADED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'DEFECTIVE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Controls Bar: Search & Filter */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </form>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Label Filter:</span>
          </div>

          <select
            value={qualityLabel}
            onChange={(e) => {
              setQualityLabel(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Labels</option>
            <option value="ACCEPTABLE">Acceptable</option>
            <option value="DEGRADED">Degraded</option>
            <option value="DEFECTIVE">Defective</option>
          </select>

          <button
            onClick={loadData}
            className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* Grid View of Analyses */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm font-medium">Loading analysis records from database...</p>
        </div>
      ) : data.analyses.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 space-y-2">
          <HardDrive className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-base font-semibold text-slate-300">No Analysis History Found</h4>
          <p className="text-xs text-slate-500">Upload an image in the Analysis Hub to generate evaluation records.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.analyses.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectAnalysis(item)}
              className="glass-card rounded-2xl overflow-hidden border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail Image */}
                <div className="relative h-40 bg-slate-950 overflow-hidden border-b border-slate-800">
                  <img
                    src={item.original_image_url}
                    alt={item.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Quality Label Badge */}
                  <span
                    className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-lg backdrop-blur-md uppercase tracking-wider ${getLabelBadge(
                      item.quality_label
                    )}`}
                  >
                    {item.quality_label}
                  </span>

                  {/* Quality Score Pill */}
                  <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-extrabold text-cyan-400">
                    Score: {item.quality_score}/100
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-2">
                  <h4 className="font-semibold text-slate-200 text-sm truncate" title={item.filename}>
                    {item.filename}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </span>
                    <span>{(item.file_size_bytes / 1024).toFixed(0)} KB</span>
                  </div>

                  <div className="text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                    {item.issues?.length || 0} Issues Detected
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs">
                <button className="text-cyan-400 font-semibold flex items-center space-x-1 hover:underline">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>

                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 text-xs text-slate-400">
          <div>
            Showing Page {data.page} of {totalPages} ({data.total} total items)
          </div>

          <div className="flex items-center space-x-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
