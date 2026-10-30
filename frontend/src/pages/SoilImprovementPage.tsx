import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2, Leaf, Clock, BookOpen } from 'lucide-react';
import { fetchSoilRemediation, fetchHistory } from '../services/api';
import { RemediationItem, SoilSampleItem } from '../types';

export const SoilImprovementPage: React.FC = () => {
  const [samples, setSamples] = useState<SoilSampleItem[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<number | null>(null);
  const [plan, setPlan] = useState<RemediationItem[]>([]);
  const [issuesCount, setIssuesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory('', '', 50, 0)
      .then((hData) => {
        setSamples(hData.samples);
        if (hData.samples.length > 0) {
          const firstId = hData.samples[0].id;
          setSelectedSampleId(firstId);
          return fetchSoilRemediation({ sample_id: firstId });
        }
        return { issues_count: 0, plan: [], evals: [] };
      })
      .then((remData) => {
        setPlan(remData.plan);
        setIssuesCount(remData.issues_count);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSampleChange = async (id: number) => {
    setSelectedSampleId(id);
    setLoading(true);
    try {
      const data = await fetchSoilRemediation({ sample_id: id });
      setPlan(data.plan);
      setIssuesCount(data.issues_count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedSample = samples.find((s) => s.id === selectedSampleId);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Soil Remediation & Agronomic Improvement Guide
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Targeted soil conditioning protocols addressing detected nutrient deficits and pH imbalances.
          </p>
        </div>

        {/* Sample Selector */}
        {samples.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Field Sample:</span>
            <select
              value={selectedSampleId || ''}
              onChange={(e) => handleSampleChange(Number(e.target.value))}
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

      {/* Issues Detected Summary Banner */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white ${
                issuesCount === 0 ? 'bg-emerald-600' : 'bg-amber-500'
              }`}
            >
              {issuesCount}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {issuesCount === 0
                  ? 'All Elemental Parameters in Optimal Balance'
                  : `${issuesCount} Soil Limitation${issuesCount > 1 ? 's' : ''} Identified`}
              </h3>
              <p className="text-xs text-slate-500">
                Assessing {selectedSample?.sample_name || 'Selected Field'}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 max-w-sm">
            Agronomic interventions should be verified through local extension services before bulk field application.
          </div>
        </div>
      </div>

      {/* Remediation Cards List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
        </div>
      ) : plan.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 mb-2" />
          <h3 className="text-base font-bold text-emerald-950">No Critical Deficiencies Detected</h3>
          <p className="mt-1 text-xs text-emerald-800/80 max-w-md mx-auto">
            This soil profile meets all standard agronomic sufficiency thresholds for macro and micronutrients.
            Maintain balanced crop rotation and organic matter replenishment.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {plan.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-base text-slate-900">{item.condition}</span>
                  <span className="text-xs text-slate-400 font-medium">({item.parameter})</span>
                </div>
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase ${
                    item.severity === 'Critical'
                      ? 'bg-rose-100 text-rose-800'
                      : item.severity === 'Moderate'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.severity} Severity
                </span>
              </div>

              {/* Cause */}
              <div className="mt-4 text-xs text-slate-600 leading-relaxed">
                <b className="text-slate-800">Underlying Agronomic Cause:</b> {item.cause}
              </div>

              {/* Conventional vs Organic Remedies Grid */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1.5">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>Conventional Agronomic Intervention</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.conventional_remedy}
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-1.5">
                    <Leaf className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Organic & Biological Alternatives</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {item.organic_remedy}
                  </p>
                </div>
              </div>

              {/* Follow-up Soil Testing Advice */}
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-100/70 p-3 text-xs text-slate-600">
                <Clock className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <b className="text-slate-800">Monitoring Advice:</b> {item.monitoring_advice}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

