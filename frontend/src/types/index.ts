export interface SoilInput {
  sample_name?: string;
  notes?: string;
  N: number;
  P: number;
  K: number;
  ph: number;
  ec: number;
  oc: number;
  S: number;
  zn: number;
  fe: number;
  cu: number;
  Mn: number;
  B: number;
}

export interface NutrientEvaluation {
  name: string;
  symbol: string;
  value: number;
  unit: string;
  status: 'Deficient' | 'Low' | 'Optimal' | 'High' | 'Excessive' | 'Strongly Acidic' | 'Moderately Acidic' | 'Moderately Alkaline' | 'Strongly Alkaline' | 'Slightly High';
  optimal_range: string;
  impact: string;
}

export interface PredictionResult {
  status: string;
  id?: number;
  sample_name: string;
  created_at: string;
  fertility_class: number;
  fertility_label: 'Less Fertile' | 'Fertile' | 'Highly Fertile';
  confidence: number;
  probabilities: {
    'Less Fertile': number;
    'Fertile': number;
    'Highly Fertile': number;
  };
  readings: Record<string, number>;
  nutrient_evaluations: NutrientEvaluation[];
  summary: string;
}

export interface SoilSampleItem {
  id: number;
  sample_name: string;
  created_at: string;
  readings: Record<string, number>;
  fertility_class: number;
  fertility_label: 'Less Fertile' | 'Fertile' | 'Highly Fertile';
  confidence: number;
  probabilities: {
    'Less Fertile': number;
    'Fertile': number;
    'Highly Fertile': number;
  };
  notes?: string;
  is_demo: boolean;
}

export interface CropRecommendation {
  crop_name: string;
  category: string;
  suitability_score: number;
  suitability_level: 'High' | 'Moderate' | 'Marginal';
  ideal_ph: string;
  nutrient_match: string;
  recommendation: string;
}

export interface RemediationItem {
  parameter: string;
  condition: string;
  severity: 'Critical' | 'Moderate' | 'Mild';
  cause: string;
  conventional_remedy: string;
  organic_remedy: string;
  monitoring_advice: string;
}

export interface AnalyticsKPIs {
  total_samples: number;
  highly_fertile: number;
  fertile: number;
  less_fertile: number;
  avg_ph: number;
  avg_oc: number;
  avg_ec: number;
}

export interface AnalyticsData {
  status: string;
  kpis: AnalyticsKPIs;
  fertility_distribution: { name: string; value: number; color: string }[];
  nutrient_averages: { nutrient: string; value: number; benchmark: number; unit: string }[];
  deficiency_stats: {
    feature: string;
    name: string;
    unit: string;
    deficient_pct: number;
    optimal_pct: number;
    excess_pct: number;
  }[];
  timeline: {
    id: number;
    sample_name: string;
    date: string;
    fertility_label: string;
    confidence: number;
    ph: number;
    ec: number;
    oc: number;
  }[];
}

export interface ModelBenchmarkItem {
  model_name: string;
  accuracy: number;
  macro_precision: number;
  macro_recall: number;
  macro_f1: number;
}

export interface ModelInfoData {
  status: string;
  model_name: string;
  version: string;
  dataset_info: {
    source: string;
    total_instances: number;
    features_count: number;
    classes: string[];
    class_counts: Record<string, number>;
  };
  train_test_split: string;
  accuracy: number;
  macro_precision: number;
  macro_recall: number;
  macro_f1: number;
  classification_report: Record<string, any>;
  confusion_matrix: number[][];
  feature_importances: { feature: string; importance: number; description: string }[];
  multi_model_benchmark: ModelBenchmarkItem[];
  limitations: string[];
}

