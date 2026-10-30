import {
  SoilInput,
  PredictionResult,
  SoilSampleItem,
  CropRecommendation,
  RemediationItem,
  AnalyticsData,
  ModelInfoData
} from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<{ status: string; service: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to reach backend server');
  return res.json();
}

export async function fetchPresets(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/presets`);
  if (!res.ok) throw new Error('Failed to load sample presets');
  const data = await res.json();
  return data.presets || [];
}

export async function predictSoil(payload: SoilInput): Promise<PredictionResult> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Prediction request failed' }));
    throw new Error(err.detail || 'Prediction failed');
  }
  return res.json();
}

export async function fetchHistory(search = '', fertility = '', limit = 50, offset = 0): Promise<{ total: number; samples: SoilSampleItem[] }> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (fertility && fertility !== 'All') params.append('fertility', fertility);
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());

  const res = await fetch(`${API_BASE}/history?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  const data = await res.json();
  return { total: data.total, samples: data.samples || [] };
}

export async function fetchHistoryDetail(id: number): Promise<any> {
  const res = await fetch(`${API_BASE}/history/${id}`);
  if (!res.ok) throw new Error(`Failed to load sample #${id}`);
  const data = await res.json();
  return data.sample;
}

export async function deleteSample(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete sample #${id}`);
}

export async function compareSamples(sampleIds: number[]): Promise<any> {
  const res = await fetch(`${API_BASE}/history/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sample_ids: sampleIds }),
  });
  if (!res.ok) throw new Error('Failed to compare selected samples');
  return res.json();
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error('Failed to load analytics');
  return res.json();
}

export async function fetchModelInfo(): Promise<ModelInfoData> {
  const res = await fetch(`${API_BASE}/model-info`);
  if (!res.ok) throw new Error('Failed to load model insights');
  return res.json();
}

export async function fetchCropRecommendations(params: { sample_id?: number; readings?: Record<string, number>; fertility_class?: number }): Promise<CropRecommendation[]> {
  const res = await fetch(`${API_BASE}/recommendations/crops`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to fetch crop recommendations');
  const data = await res.json();
  return data.recommendations || [];
}

export async function fetchSoilRemediation(params: { sample_id?: number; readings?: Record<string, number> }): Promise<{ issues_count: number; plan: RemediationItem[]; evals: any[] }> {
  const res = await fetch(`${API_BASE}/recommendations/soil-improvement`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to fetch soil remediation plan');
  const data = await res.json();
  return {
    issues_count: data.issues_detected_count,
    plan: data.remediation_plan || [],
    evals: data.nutrient_evaluations || [],
  };
}

export async function uploadBatchCSV(file: File): Promise<{ total: number; results: any[] }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/predict/batch`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Batch upload failed' }));
    throw new Error(err.detail || 'Batch CSV upload failed');
  }
  const data = await res.json();
  return { total: data.total_processed, results: data.results || [] };
}

