import React from 'react';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export const CompareModal: React.FC<CompareModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data || !data.samples) return null;

  const samples = data.samples;
  const features = ['N', 'P', 'K', 'ph', 'ec', 'oc', 'S', 'zn', 'fe', 'cu', 'Mn', 'B'];

  const featureLabels: Record<string, string> = {
    N: 'Nitrogen (N)',
    P: 'Phosphorus (P)',
    K: 'Potassium (K)',
    ph: 'Soil pH',
    ec: 'Conductivity (EC)',
    oc: 'Organic Carbon (OC)',
    S: 'Sulfur (S)',
    zn: 'Zinc (Zn)',
    fe: 'Iron (Fe)',
    cu: 'Copper (Cu)',
    Mn: 'Manganese (Mn)',
    B: 'Boron (B)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Soil Sample Comparative Analysis</h2>
            <p className="text-xs text-slate-500">
              Comparing {samples.length} selected soil profiles side-by-side
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-x-auto p-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-3 font-semibold text-slate-700">Parameter / Feature</th>
                {samples.map((s: any) => (
                  <th key={s.id} className="p-3 font-bold text-slate-900">
                    <div>{s.sample_name}</div>
                    <div className="text-[10px] font-normal text-slate-500">{s.created_at}</div>
                  </th>
                ))}
                <th className="p-3 font-semibold text-emerald-800">Variance (Delta)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Classification Row */}
              <tr className="bg-emerald-50/30">
                <td className="p-3 font-bold text-slate-900">Predicted Fertility</td>
                {samples.map((s: any) => (
                  <td key={s.id} className="p-3">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${
                        s.fertility_label === 'Highly Fertile'
                          ? 'bg-emerald-600 text-white'
                          : s.fertility_label === 'Fertile'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {s.fertility_label}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-0.5">{s.confidence}% conf</div>
                  </td>
                ))}
                <td className="p-3 text-slate-400">—</td>
              </tr>

              {/* 12 Feature Rows */}
              {features.map((feat) => {
                const diff = data.feature_diffs?.[feat];
                return (
                  <tr key={feat} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-medium text-slate-800">{featureLabels[feat]}</td>
                    {samples.map((s: any) => (
                      <td key={s.id} className="p-3 font-semibold text-slate-900">
                        {s.readings?.[feat]}
                      </td>
                    ))}
                    <td className="p-3 font-medium text-emerald-700">
                      {diff ? `Δ ${diff.delta} (range ${diff.min} - ${diff.max})` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

