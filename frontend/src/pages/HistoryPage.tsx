import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Trash2,
  CheckSquare,
  Square,
  FileText,
  AlertTriangle,
  RotateCw,
  Plus
} from 'lucide-react';
import { fetchHistory, deleteSample, compareSamples, uploadBatchCSV, fetchHistoryDetail } from '../services/api';
import { SoilSampleItem } from '../types';
import { ReportModal } from '../components/ReportModal';
import { CompareModal } from '../components/CompareModal';

export const HistoryPage: React.FC = () => {
  const [samples, setSamples] = useState<SoilSampleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [fertilityFilter, setFertilityFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [compareData, setCompareData] = useState<any>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchHistory(search, fertilityFilter, 100, 0);
      setSamples(data.samples);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [search, fertilityFilter]);

  const handleDelete = async (id: number) => {
    if (window.confirm(`Delete soil analysis record #${id}?`)) {
      try {
        await deleteSample(id);
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        loadHistory();
      } catch (err) {
        alert('Could not delete record.');
      }
    }
  };

  const handleViewReport = async (id: number) => {
    try {
      const detail = await fetchHistoryDetail(id);
      setSelectedReport(detail);
      setIsReportOpen(true);
    } catch (err) {
      alert('Could not load report detail.');
    }
  };

  const toggleSelectSample = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) {
      alert('Please select at least 2 samples to compare (up to 5).');
      return;
    }
    try {
      const comp = await compareSamples(selectedIds);
      setCompareData(comp);
      setIsCompareOpen(true);
    } catch (err: any) {
      alert(err.message || 'Comparison failed.');
    }
  };

  const handleExportCSV = () => {
    window.location.href = '/api/export/csv';
  };

  const handleBatchUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchFile) return;
    setBatchLoading(true);
    try {
      const res = await uploadBatchCSV(batchFile);
      alert(`Successfully processed ${res.total} soil samples from CSV!`);
      setIsBatchOpen(false);
      setBatchFile(null);
      loadHistory();
    } catch (err: any) {
      alert(err.message || 'CSV upload failed.');
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Historical Soil Health Records
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete audit trail of all processed field analyses, side-by-side comparison, and batch CSV imports.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsBatchOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Upload className="h-3.5 w-3.5 text-slate-500" />
            <span>Upload Batch CSV</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by field name or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Filter:</span>
            <select
              value={fertilityFilter}
              onChange={(e) => setFertilityFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none"
            >
              <option value="All">All Fertility Classes</option>
              <option value="Highly Fertile">Highly Fertile</option>
              <option value="Fertile">Fertile</option>
              <option value="Less Fertile">Less Fertile</option>
            </select>
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={handleCompare}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <span>Compare Selected ({selectedIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3.5 w-10 text-center">Select</th>
                <th className="px-4 py-3.5">ID</th>
                <th className="px-4 py-3.5">Sample Name</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Fertility Status</th>
                <th className="px-4 py-3.5">Confidence</th>
                <th className="px-4 py-3.5">pH</th>
                <th className="px-4 py-3.5">EC (dS/m)</th>
                <th className="px-4 py-3.5">NPK Ratio</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400">
                    Loading records...
                  </td>
                </tr>
              ) : samples.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-500">
                    No soil analysis records match the search criteria.
                  </td>
                </tr>
              ) : (
                samples.map((sample) => {
                  const isSelected = selectedIds.includes(sample.id);
                  return (
                    <tr
                      key={sample.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectSample(sample.id)}
                          className="text-slate-400 hover:text-emerald-700"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-400">#{sample.id}</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{sample.sample_name}</span>
                          {sample.is_demo && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                              Demo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">
                        {sample.created_at ? new Date(sample.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            sample.fertility_label === 'Highly Fertile'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : sample.fertility_label === 'Fertile'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {sample.fertility_label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800">
                        {sample.confidence}%
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">{sample.readings?.ph}</td>
                      <td className="px-4 py-3.5 text-slate-700">{sample.readings?.ec}</td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono">
                        {sample.readings?.N}/{sample.readings?.P}/{sample.readings?.K}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewReport(sample.id)}
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-emerald-700 transition-colors"
                            title="View Full Report"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sample.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Batch Upload Modal */}
      {isBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-2">Upload Soil Samples CSV</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Upload a comma-separated CSV file with columns for the 12 features (N, P, K, ph, ec, oc, S, zn, fe, cu, Mn, B).
            </p>

            <form onSubmit={handleBatchUpload} className="space-y-4">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setBatchFile(e.target.files ? e.target.files[0] : null)}
                required
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBatchOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={batchLoading || !batchFile}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {batchLoading ? 'Uploading & Predicting...' : 'Run Batch Analysis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        report={selectedReport}
      />

      {/* Compare Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        data={compareData}
      />
    </div>
  );
};

