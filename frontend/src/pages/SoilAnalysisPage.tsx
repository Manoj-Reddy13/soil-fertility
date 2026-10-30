import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Sparkles,
  Info,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  Sprout,
  ShieldAlert,
  HelpCircle,
  FileText
} from 'lucide-react';
import { predictSoil, fetchPresets } from '../services/api';
import { SoilInput, PredictionResult } from '../types';
import { ReportModal } from '../components/ReportModal';

export const SoilAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Form state initialized with standard default values
  const [formData, setFormData] = useState<SoilInput>({
    sample_name: 'Field Lot A-1',
    notes: 'Routine seasonal pre-sowing soil fertility evaluation',
    N: 270.0,
    P: 15.0,
    K: 350.0,
    ph: 7.2,
    ec: 0.65,
    oc: 0.75,
    S: 12.5,
    zn: 0.85,
    fe: 4.5,
    cu: 0.75,
    Mn: 6.8,
    B: 0.85,
  });

  useEffect(() => {
    fetchPresets()
      .then((data) => setPresets(data))
      .catch((err) => console.error('Failed to load presets:', err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value,
    }));
  };

  const handleApplyPreset = (presetData: any) => {
    setFormData({
      sample_name: presetData.sample_name || 'Preset Sample',
      notes: presetData.notes || 'Loaded demonstration sample',
      N: presetData.N,
      P: presetData.P,
      K: presetData.K,
      ph: presetData.ph,
      ec: presetData.ec,
      oc: presetData.oc,
      S: presetData.S,
      zn: presetData.zn,
      fe: presetData.fe,
      cu: presetData.cu,
      Mn: presetData.Mn,
      B: presetData.B,
    });
    setResult(null);
    setError(null);
  };

  const handleReset = () => {
    setFormData({
      sample_name: 'New Field Sample',
      notes: '',
      N: 250.0,
      P: 15.0,
      K: 250.0,
      ph: 7.0,
      ec: 0.5,
      oc: 0.6,
      S: 10.0,
      zn: 0.8,
      fe: 5.0,
      cu: 0.5,
      Mn: 5.0,
      B: 0.8,
    });
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (formData.ph < 2.5 || formData.ph > 12.0) {
      setError('Soil pH must be between 2.5 and 12.0.');
      setLoading(false);
      return;
    }

    try {
      const response = await predictSoil(formData);
      setResult(response);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Prediction request failed. Ensure backend server is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Soil Chemical Analysis & ML Prediction
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter the 12 laboratory elemental soil readings to execute live Random Forest classification.
          </p>
        </div>

        {/* Demo Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">Load Preset:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p.data)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-colors"
            >
              {p.fertility_expected}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Analysis Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sample Metadata Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider text-emerald-800">
            Sample Identification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sample Identifier / Field Name
              </label>
              <input
                type="text"
                name="sample_name"
                value={formData.sample_name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none transition-colors"
                placeholder="e.g. North Orchard Sector 4"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Field Observations & Notes (Optional)
              </label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none transition-colors"
                placeholder="e.g. Clay loam soil, drip irrigation, cover cropped"
              />
            </div>
          </div>
        </div>

        {/* Group 1: Primary Macro Nutrients (N, P, K) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
              1
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Primary Macro Nutrients (NPK)
            </h3>
            <span className="text-[11px] text-slate-400">Unit: kg/ha</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Nitrogen (N)</label>
                <span className="text-[10px] text-slate-400">Optimal: 280-560</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1200"
                name="N"
                value={formData.N}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Available nitrogen ratio (NH4+)</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Phosphorus (P)</label>
                <span className="text-[10px] text-slate-400">Optimal: 10-25</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="300"
                name="P"
                value={formData.P}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Available phosphorus content</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Potassium (K)</label>
                <span className="text-[10px] text-slate-400">Optimal: 110-280</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2000"
                name="K"
                value={formData.K}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Available potassium ratio</p>
            </div>
          </div>
        </div>

        {/* Group 2: Soil Chemical & Physical Properties */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
              2
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Soil Reaction, Salinity & Biological Vitality
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Soil pH</label>
                <span className="text-[10px] text-slate-400">Optimal: 6.0-7.5</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="2.5"
                max="12.0"
                name="ph"
                value={formData.ph}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Acidity (&lt;6) or alkalinity (&gt;7.8)</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">EC (dS/m)</label>
                <span className="text-[10px] text-slate-400">Optimal: &lt;1.5</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                max="30"
                name="ec"
                value={formData.ec}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Electrical conductivity (salinity)</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Organic Carbon (OC %)</label>
                <span className="text-[10px] text-slate-400">Optimal: 0.5-0.8%</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                max="15"
                name="oc"
                value={formData.oc}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Soil biological humus percentage</p>
            </div>
          </div>
        </div>

        {/* Group 3: Micronutrients & Secondary Elements */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
              3
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Micronutrients & Secondary Elements
            </h3>
            <span className="text-[11px] text-slate-400">Unit: ppm (mg/kg)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sulfur (S)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                name="S"
                value={formData.S}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Range: 10-20</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Zinc (Zn)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="zn"
                value={formData.zn}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Range: 0.6-1.5</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Iron (Fe)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="fe"
                value={formData.fe}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Range: 4.5-10</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Copper (Cu)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="cu"
                value={formData.cu}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Range: 0.2-1.0</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Manganese (Mn)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="Mn"
                value={formData.Mn}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Range: 2.0-10</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Boron (B)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="B"
                value={formData.B}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Range: 0.5-2.0</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Fields</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-md shadow-emerald-900/15 hover:bg-emerald-700 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            <FlaskConical className="h-4 w-4" />
            <span>{loading ? 'Evaluating Model...' : 'Execute Fertility Prediction'}</span>
          </button>
        </div>
      </form>

      {/* Prediction Results Display */}
      {result && (
        <div className="rounded-3xl border border-emerald-300/80 bg-white p-8 shadow-xl shadow-emerald-950/5 space-y-8 animate-fadeIn">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>Prediction Analysis Complete</span>
              </div>
              <h3 className="mt-1 text-2xl font-black text-slate-900">
                {result.sample_name}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Record #{result.id} • Processed at {result.created_at}
              </p>
            </div>

            {/* Classification Badge & Confidence */}
            <div className="flex items-center gap-4">
              <div
                className={`rounded-2xl px-6 py-3 text-xl font-black shadow-sm ${
                  result.fertility_label === 'Highly Fertile'
                    ? 'bg-emerald-600 text-white'
                    : result.fertility_label === 'Fertile'
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {result.fertility_label}
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-slate-900">{result.confidence}%</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Confidence</div>
              </div>
            </div>
          </div>

          {/* Model Probability Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Model Ensemble Probability Distribution
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Less Fertile</span>
                  <span className="font-bold text-rose-600">{result.probabilities['Less Fertile']}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${result.probabilities['Less Fertile']}%` }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Fertile</span>
                  <span className="font-bold text-amber-600">{result.probabilities['Fertile']}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${result.probabilities['Fertile']}%` }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Highly Fertile</span>
                  <span className="font-bold text-emerald-600">{result.probabilities['Highly Fertile']}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${result.probabilities['Highly Fertile']}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 12 Nutrient Evaluations Chips */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Nutrient Status Diagnostics (12 Parameters)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {result.nutrient_evaluations?.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200/90 p-3 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">{item.name}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        item.status === 'Optimal'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status.includes('Deficient') || item.status.includes('Acidic')
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {item.value} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500 truncate" title={item.optimal_range}>
                    Target: {item.optimal_range}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps Action Links */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
            <button
              onClick={() => setIsReportOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FileText className="h-4 w-4 text-emerald-700" />
              <span>Download Official Report (PDF / Print)</span>
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/crops')}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                <Sprout className="h-4 w-4" />
                <span>Crop Recommendations →</span>
              </button>
              <button
                onClick={() => navigate('/improvement')}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Remediation Plan →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        report={
          result
            ? {
                report_id: `SOIL-${result.id || 100}`,
                generated_at: result.created_at,
                sample_info: { sample_name: result.sample_name, notes: formData.notes },
                fertility_prediction: {
                  label: result.fertility_label,
                  confidence: result.confidence,
                  probabilities: result.probabilities,
                },
                nutrient_evaluations: result.nutrient_evaluations,
              }
            : null
        }
      />
    </div>
  );
};

