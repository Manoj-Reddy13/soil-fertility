import React, { useState, useEffect } from 'react';
import { Sprout, CheckCircle2, AlertTriangle, Filter, Sparkles, HelpCircle, Layers } from 'lucide-react';
import { fetchCropRecommendations, fetchHistory } from '../services/api';
import { CropRecommendation, SoilSampleItem } from '../types';

export const CropRecommendationsPage: React.FC = () => {
  const [samples, setSamples] = useState<SoilSampleItem[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<number | null>(null);
  const [crops, setCrops] = useState<CropRecommendation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory('', '', 50, 0)
      .then((hData) => {
        setSamples(hData.samples);
        if (hData.samples.length > 0) {
          const firstId = hData.samples[0].id;
          setSelectedSampleId(firstId);
          return fetchCropRecommendations({ sample_id: firstId });
        }
        return [];
      })
      .then((cropsData) => {
        setCrops(cropsData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSampleChange = async (id: number) => {
    setSelectedSampleId(id);
    setLoading(true);
    try {
      const data = await fetchCropRecommendations({ sample_id: id });
      setCrops(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedSample = samples.find((s) => s.id === selectedSampleId);

  const categories = ['All', 'Cereal Grain', 'Pulses & Legumes', 'Oilseed / Legume', 'Commercial Fiber', 'Horticultural Vegetable', 'Tuber Vegetable', 'Resilient Millet'];

  const filteredCrops = selectedCategory === 'All'
    ? crops
    : crops.filter((c) => c.category === selectedCategory);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Precision Crop Suitability Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Empirical rule-based suitability scoring matching field soil chemistry with physiological crop requirements.
          </p>
        </div>

        {/* Sample Picker */}
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

      {/* Selected Soil Profile Summary Banner */}
      {selectedSample && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase text-emerald-800">
                Active Soil Baseline
              </span>
              <h3 className="text-base font-bold text-slate-900">{selectedSample.sample_name}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded-lg bg-slate-100 px-3 py-1 font-medium text-slate-700">
                pH: <b>{selectedSample.readings?.ph}</b>
              </span>
              <span className="rounded-lg bg-slate-100 px-3 py-1 font-medium text-slate-700">
                EC: <b>{selectedSample.readings?.ec} dS/m</b>
              </span>
              <span className="rounded-lg bg-slate-100 px-3 py-1 font-medium text-slate-700">
                OC: <b>{selectedSample.readings?.oc}%</b>
              </span>
              <span className="rounded-lg bg-slate-100 px-3 py-1 font-medium text-slate-700">
                NPK: <b>{selectedSample.readings?.N} / {selectedSample.readings?.P} / {selectedSample.readings?.K}</b>
              </span>
              <span
                className={`rounded-lg px-3 py-1 font-bold ${
                  selectedSample.fertility_label === 'Highly Fertile'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedSample.fertility_label === 'Fertile'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {selectedSample.fertility_label}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="h-4 w-4 text-slate-400 shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Crop Suitability Cards Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCrops.map((crop, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {crop.category}
                  </span>
                  <h3 className="mt-1 text-base font-bold text-slate-900">{crop.crop_name}</h3>
                </div>

                {/* Score Pill */}
                <div className="text-right">
                  <div
                    className={`inline-block rounded-xl px-3 py-1 text-sm font-black ${
                      crop.suitability_score >= 75
                        ? 'bg-emerald-100 text-emerald-800'
                        : crop.suitability_score >= 55
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {crop.suitability_score}% Match
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                    {crop.suitability_level} Suitability
                  </div>
                </div>
              </div>

              {/* Requirements Chips */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-semibold">TOLERANT pH</span>
                  <span className="font-semibold text-slate-800">{crop.ideal_ph}</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-semibold">NUTRIENT DEMAND</span>
                  <span className="font-semibold text-slate-800">{crop.nutrient_match}</span>
                </div>
              </div>

              {/* Recommendation Note */}
              <p className="mt-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {crop.recommendation}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Transparent Methodology Box */}
      <div className="rounded-2xl border border-emerald-900/20 bg-emerald-950/5 p-5 text-xs text-slate-600 leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1">
          <HelpCircle className="h-4 w-4 text-emerald-700" />
          <span>Transparent Crop Matching Methodology</span>
        </div>
        <p>
          Suitability scores are calculated using documented agronomic tolerance functions: pH compatibility (35%), salinity EC limits (25%), organic carbon biological baseline (20%), and primary NPK nutrient demand (20%). This rule engine operates independently from the Random Forest soil fertility classifier.
        </p>
      </div>
    </div>
  );
};

