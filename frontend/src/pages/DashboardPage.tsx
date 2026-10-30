import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Sprout,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Eye,
  Trash2,
  ArrowUpRight,
  ShieldAlert,
  Layers,
  Leaf
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import { fetchAnalytics, fetchHistory, deleteSample, fetchHistoryDetail } from '../services/api';
import { AnalyticsData, SoilSampleItem } from '../types';
import { ReportModal } from '../components/ReportModal';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentSamples, setRecentSamples] = useState<SoilSampleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsData, historyData] = await Promise.all([
        fetchAnalytics(),
        fetchHistory('', '', 5, 0),
      ]);
      setAnalytics(analyticsData);
      setRecentSamples(historyData.samples);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm(`Delete soil analysis record #${id}?`)) {
      try {
        await deleteSample(id);
        loadData();
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
      alert('Could not open report.');
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
          <p className="text-xs font-medium text-slate-500">Loading Soil Intelligence Platform...</p>
        </div>
      </div>
    );
  }

  const kpis = analytics.kpis;
  const fertilityColors: Record<string, string> = {
    'Highly Fertile': '#10b981',
    'Fertile': '#f59e0b',
    'Less Fertile': '#ef4444',
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#06301d] via-[#083b24] to-[#0d4a2f] p-7 text-white shadow-lg shadow-emerald-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Leaf className="h-3.5 w-3.5" />
              Agronomic Decision System
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back to SoilSense AI
            </h2>
            <p className="mt-2 text-xs text-emerald-100/75 sm:text-sm leading-relaxed">
              Empirical elemental analysis and Random Forest model classification.
              Currently monitoring {kpis.total_samples} field sample records.
            </p>
          </div>
          <button
            onClick={() => navigate('/analyze')}
            className="flex items-center gap-2 self-start rounded-xl bg-emerald-500 px-5 py-3 text-xs font-bold text-slate-950 shadow-md hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95"
          >
            <FlaskConical className="h-4 w-4" />
            <span>Perform Soil Analysis</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Analyzed</span>
            <Layers className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">{kpis.total_samples}</div>
          <div className="mt-2 flex items-center text-[11px] text-slate-500">
            <span>Recorded field samples</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Highly Fertile</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-700">{kpis.highly_fertile}</div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            {kpis.total_samples ? Math.round((kpis.highly_fertile / kpis.total_samples) * 100) : 0}% of total dataset
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Fertile</span>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-amber-600">{kpis.fertile}</div>
          <div className="mt-2 text-[11px] text-amber-600 font-medium">
            {kpis.total_samples ? Math.round((kpis.fertile / kpis.total_samples) * 100) : 0}% of total dataset
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Less Fertile</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-rose-600">{kpis.less_fertile}</div>
          <div className="mt-2 text-[11px] text-rose-600 font-medium">
            Requires active soil remediation
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fertility Distribution Donut */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm lg:col-span-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Fertility Classification</h3>
            <span className="text-[11px] text-slate-400">Class Split</span>
          </div>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.fertility_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {analytics.fertility_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} samples`, name]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nutrient Averages vs Agronomic Benchmarks */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm lg:col-span-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Average Nutrients vs Agronomic Benchmarks</h3>
              <p className="text-xs text-slate-500">Comparing sample mean against standard optimal levels</p>
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Full Analytics →
            </button>
          </div>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.nutrient_averages} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="nutrient" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="value" name="Sample Average" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="benchmark" name="Agronomic Benchmark" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Soil Analyses Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Soil Health Analyses</h3>
            <p className="text-xs text-slate-500">Most recently processed field samples and predictions</p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <span>View All Records</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Sample Name</th>
                <th className="px-6 py-3.5">Analyzed Date</th>
                <th className="px-6 py-3.5">Fertility Status</th>
                <th className="px-6 py-3.5">Confidence</th>
                <th className="px-6 py-3.5">pH Reaction</th>
                <th className="px-6 py-3.5">NPK Readings</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentSamples.map((sample) => (
                <tr key={sample.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{sample.sample_name}</span>
                      {sample.is_demo && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                          Demo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {sample.created_at ? new Date(sample.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold ${
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
                  <td className="px-6 py-4 font-semibold text-slate-800">{sample.confidence}%</td>
                  <td className="px-6 py-4 text-slate-700">{sample.readings?.ph}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {sample.readings?.N} / {sample.readings?.P} / {sample.readings?.K}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewReport(sample.id)}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-emerald-700 transition-colors"
                        title="View Official Report"
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        report={selectedReport}
      />
    </div>
  );
};

