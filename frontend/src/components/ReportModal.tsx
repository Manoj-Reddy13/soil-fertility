import React from 'react';
import { X, Printer, Download, Leaf, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: any;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, report }) => {
  if (!isOpen || !report) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${report.report_id || 'soil_report'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const fertilityLabel = report.fertility_prediction?.label || 'Unknown';
  const confidence = report.fertility_prediction?.confidence || 0;

  const getStatusBadge = (status: string) => {
    if (status === 'Optimal') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
          <CheckCircle className="h-3 w-3" /> Optimal
        </span>
      );
    }
    if (status.includes('Acidic') || status.includes('Alkaline') || status === 'Deficient') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
          <AlertCircle className="h-3 w-3" /> {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
        <AlertTriangle className="h-3 w-3" /> {status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
        {/* Modal Controls (Hidden in print) */}
        <div className="no-print flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-emerald-600" />
            <span className="font-bold text-slate-800">Official Soil Health Report</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download JSON</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div className="max-h-[80vh] overflow-y-auto p-8" id="printable-report">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row justify-between border-b-2 border-emerald-800 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white font-bold">
                  S
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-emerald-950">
                  SoilSense AI Intelligence Report
                </h2>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Machine Learning Elemental Soil Assessment • Random Forest Model (v1.2)
              </p>
            </div>
            <div className="mt-4 sm:mt-0 text-left sm:text-right text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Report ID: {report.report_id}</p>
              <p>Generated: {report.generated_at}</p>
              <p>Sample: {report.sample_info?.sample_name}</p>
            </div>
          </div>

          {/* Fertility Classification Summary */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Fertility Classification
                </span>
                <div className="mt-1 flex items-center gap-3">
                  <span
                    className={`rounded-xl px-4 py-1.5 text-lg font-bold shadow-sm ${
                      fertilityLabel === 'Highly Fertile'
                        ? 'bg-emerald-600 text-white'
                        : fertilityLabel === 'Fertile'
                        ? 'bg-amber-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {fertilityLabel}
                  </span>
                  <span className="text-sm font-medium text-slate-600">
                    Confidence: <b className="text-slate-900">{confidence}%</b>
                  </span>
                </div>
              </div>

              {/* Probability Split */}
              <div className="flex gap-4 text-xs">
                <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                  <span className="text-slate-500">Less Fertile:</span>{' '}
                  <b className="text-rose-600">{report.fertility_prediction?.probabilities?.['Less Fertile']}%</b>
                </div>
                <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                  <span className="text-slate-500">Fertile:</span>{' '}
                  <b className="text-amber-600">{report.fertility_prediction?.probabilities?.['Fertile']}%</b>
                </div>
                <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                  <span className="text-slate-500">Highly Fertile:</span>{' '}
                  <b className="text-emerald-600">{report.fertility_prediction?.probabilities?.['Highly Fertile']}%</b>
                </div>
              </div>
            </div>
          </div>

          {/* 12-Nutrient Breakdown Table */}
          <div className="mt-8">
            <h3 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
              1. Elemental Soil Composition & Agronomic Benchmark Evaluation
            </h3>
            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Nutrient / Parameter</th>
                    <th className="px-3 py-2.5 font-semibold">Measured Value</th>
                    <th className="px-3 py-2.5 font-semibold">Unit</th>
                    <th className="px-3 py-2.5 font-semibold">Status</th>
                    <th className="px-3 py-2.5 font-semibold">Optimal Agronomic Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.nutrient_evaluations?.map((item: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {item.name} ({item.symbol})
                      </td>
                      <td className="px-3 py-2 font-semibold text-slate-800">{item.value}</td>
                      <td className="px-3 py-2 text-slate-500">{item.unit}</td>
                      <td className="px-3 py-2">{getStatusBadge(item.status)}</td>
                      <td className="px-3 py-2 text-slate-600">{item.optimal_range}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Crop Recommendations */}
          {report.top_crop_recommendations?.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
                2. Suited Crops for Current Soil Chemistry
              </h3>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {report.top_crop_recommendations.slice(0, 3).map((crop: any, idx: number) => (
                  <div key={idx} className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950 text-xs">{crop.crop_name}</span>
                      <span className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        {crop.suitability_score}% Match
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                      {crop.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remediation Plan */}
          {report.remediation_plan?.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
                3. Actionable Soil Remediation Advice
              </h3>
              <div className="mt-3 space-y-3">
                {report.remediation_plan.slice(0, 3).map((plan: any, idx: number) => (
                  <div key={idx} className="rounded-xl border border-slate-200 p-3.5 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-xs">{plan.condition}</span>
                      <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                        {plan.severity}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-600">
                      <b className="text-slate-800">Conventional:</b> {plan.conventional_remedy}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      <b className="text-slate-800">Organic:</b> {plan.organic_remedy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer Footer */}
          <div className="mt-8 border-t border-slate-200 pt-4 text-[10px] text-slate-400 leading-relaxed">
            <b>Agronomic Notice:</b> This report is generated based on empirical elemental soil analysis evaluated by the SoilSense AI Random Forest Classifier. Specific field fertilization rates should be calibrated against local soil depth, irrigation water testing, and regional agricultural extension services.
          </div>
        </div>
      </div>
    </div>
  );
};

