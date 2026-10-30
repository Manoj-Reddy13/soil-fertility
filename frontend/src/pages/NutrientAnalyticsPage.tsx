import React, { useState, useEffect } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { PieChart as PieIcon, CheckCircle2, AlertTriangle, AlertCircle, Sparkles, Info } from 'lucide-react';
import { fetchAnalytics, fetchHistory } from '../services/api';
import { AnalyticsData, SoilSampleItem } from '../types';

export const NutrientAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [samples, setSamples] = useState<SoilSampleItem[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAnalytics(), fetchHistory('', '', 50, 0)])
      .then(([aData, hData]) => {
        setAnalytics(aData);
        setSamples(hData.samples);
        if (hData.samples.length > 0) {
          setSelectedSampleId(hData.samples[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !analytics) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  const selectedSample = samples.find((s) => s.id === selectedSampleId) || samples[0];

  // Normalized radar data for 12 features (scale 0-100% of benchmark)
  const radarData = selectedSample?.readings
    ? [
        { subject: 'N (Nitrogen)', value: Math.min(100, (selectedSample.readings.N / 560) * 100), fullMark: 100 },
        { subject: 'P (Phosphorus)', value: Math.min(100, (selectedSample.readings.P / 25) * 100), fullMark: 100 },
        { subject: 'K (Potassium)', value: Math.min(100, (selectedSample.readings.K / 280) * 100), fullMark: 100 },
        { subject: 'pH Balance', value: Math.min(100, (selectedSample.readings.ph / 7.5) * 100), fullMark: 100 },
        { subject: 'Conductivity (EC)', value: Math.min(100, (selectedSample.readings.ec / 1.5) * 100), fullMark: 100 },
        { subject: 'Organic C (OC)', value: Math.min(100, (selectedSample.readings.oc / 0.8) * 100), fullMark: 100 },
        { subject: 'Sulfur (S)', value: Math.min(100, (selectedSample.readings.S / 20) * 100), fullMark: 100 },
        { subject: 'Zinc (Zn)', value: Math.min(100, (selectedSample.readings.zn / 1.5) * 100), fullMark: 100 },
        { subject: 'Iron (Fe)', value: Math.min(100, (selectedSample.readings.fe / 10) * 100), fullMark: 100 },
        { subject: 'Copper (Cu)', value: Math.min(100, (selectedSample.readings.cu / 1.0) * 100), fullMark: 100 },
        { subject: 'Manganese (Mn)', value: Math.min(100, (selectedSample.readings.Mn / 10) * 100), fullMark: 100 },
        { subject: 'Boron (B)', value: Math.min(100, (selectedSample.readings.B / 2.0) * 100), fullMark: 100 },
      ]
    : [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Multivariate Nutrient Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Examine soil chemistry balance across the 12 primary, secondary, and micronutrients.
          </p>
        </div>

        {/* Sample Selector */}
        {samples.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Select Field Sample:</span>
            <select
              value={selectedSampleId || ''}
              onChange={(e) => setSelectedSampleId(Number(e.target.value))}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none shadow-sm"
            >
              {samples.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.sample_name} ({s.fertility_label})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Visual Analytics Row: Radar + Benchmark Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm lg:col-span-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">12-Nutrient Radar Profile</h3>
              <p className="text-[11px] text-slate-500">Normalized percentage of optimal target</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
              {selectedSample?.sample_name}
            </span>
          </div>

          <div className="mt-4 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar
                  name="Sample Level (%)"
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.4}
                />
                <Tooltip
                  formatter={(val: any) => [`${Math.round(val)}% of optimal target`, 'Nutrient Balance']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dataset Deficiency & Imbalance Statistics */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm lg:col-span-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Nutrient Health Distribution</h3>
              <p className="text-[11px] text-slate-500">Deficient vs Optimal vs Excess across analyzed samples</p>
            </div>
          </div>

          <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1">
            {analytics.deficiency_stats.map((stat, idx) => (
              <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">
                    {stat.name} ({stat.feature})
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <span className="text-rose-600">{stat.deficient_pct}% Deficient</span>
                    <span className="text-emerald-600">{stat.optimal_pct}% Optimal</span>
                    <span className="text-amber-600">{stat.excess_pct}% High</span>
                  </div>
                </div>

                {/* Stacked Progress Bar */}
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden flex">
                  <div className="bg-rose-500 h-full" style={{ width: `${stat.deficient_pct}%` }} title="Deficient" />
                  <div className="bg-emerald-500 h-full" style={{ width: `${stat.optimal_pct}%` }} title="Optimal" />
                  <div className="bg-amber-500 h-full" style={{ width: `${stat.excess_pct}%` }} title="High/Excess" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 12 Individual Nutrient Detail Cards */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Elemental Soil Parameter Guide & Measured Values
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: 'N', name: 'Nitrogen (N)', unit: 'kg/ha', optimal: '280 - 560 kg/ha', role: 'Drives leaf foliage, vegetative vigor, and chlorophyll synthesis.' },
            { key: 'P', name: 'Phosphorus (P)', unit: 'kg/ha', optimal: '10 - 25 kg/ha', role: 'Stimulates root establishment, flower formation, and grain setting.' },
            { key: 'K', name: 'Potassium (K)', unit: 'kg/ha', optimal: '110 - 280 kg/ha', role: 'Controls stomatal water regulation and strengthens stalk disease resistance.' },
            { key: 'ph', name: 'Soil Reaction (pH)', unit: 'pH scale', optimal: '6.0 - 7.5', role: 'Master soil chemical regulator governing nutrient solubility and uptake.' },
            { key: 'ec', name: 'Conductivity (EC)', unit: 'dS/m', optimal: '< 1.5 dS/m', role: 'Index of soluble salts; high salinity inhibits root water absorption.' },
            { key: 'oc', name: 'Organic Carbon (OC)', unit: '%', optimal: '0.50% - 0.80%', role: 'Bio-vitality foundation powering microbial activity and water holding capacity.' },
            { key: 'S', name: 'Sulfur (S)', unit: 'ppm', optimal: '10.0 - 20.0 ppm', role: 'Constituent of essential amino acids (methionine) and oil production.' },
            { key: 'zn', name: 'Zinc (Zn)', unit: 'ppm', optimal: '0.6 - 1.5 ppm', role: 'Precursor for plant growth hormones (auxins) and stem internode growth.' },
            { key: 'fe', name: 'Iron (Fe)', unit: 'ppm', optimal: '4.5 - 10.0 ppm', role: 'Essential catalyst for respiration and green chlorophyll synthesis.' },
            { key: 'cu', name: 'Copper (Cu)', unit: 'ppm', optimal: '0.2 - 1.0 ppm', role: 'Activates enzymes in photosynthesis, pollen viability, and cell walls.' },
            { key: 'Mn', name: 'Manganese (Mn)', unit: 'ppm', optimal: '2.0 - 10.0 ppm', role: 'Catalyzes water oxidation in photosynthesis and nitrogen assimilation.' },
            { key: 'B', name: 'Boron (B)', unit: 'ppm', optimal: '0.5 - 2.0 ppm', role: 'Regulates sugar translocation, pollen tube germination, and seed set.' },
          ].map((item) => {
            const val = selectedSample?.readings?.[item.key] ?? '—';
            return (
              <div key={item.key} className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{item.name}</span>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {val} {item.unit}
                  </span>
                </div>
                <div className="mt-2 text-xs font-semibold text-slate-500">
                  Target Range: <span className="text-slate-800">{item.optimal}</span>
                </div>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {item.role}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

