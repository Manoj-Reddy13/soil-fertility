from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

REQUIRED_FEATURES = ["N", "P", "K", "ph", "ec", "oc", "S", "zn", "fe", "cu", "Mn", "B"]

class SoilInputSchema(BaseModel):
    sample_name: Optional[str] = Field(default="Field Soil Sample", description="Identifier or field label")
    notes: Optional[str] = Field(default="", description="Optional observations or location details")
    
    # Primary Nutrients
    N: float = Field(..., ge=0.0, le=1200.0, description="Nitrogen content (NH4+ ratio / kg/ha)")
    P: float = Field(..., ge=0.0, le=300.0, description="Phosphorus content (P ratio / kg/ha)")
    K: float = Field(..., ge=0.0, le=2000.0, description="Potassium content (K ratio / kg/ha)")
    
    # Soil Chemical & Physical Properties
    ph: float = Field(..., ge=2.5, le=12.0, description="Soil pH level (acidity/alkalinity)")
    ec: float = Field(..., ge=0.0, le=30.0, description="Electrical Conductivity (dS/m)")
    oc: float = Field(..., ge=0.0, le=15.0, description="Organic Carbon percentage (%)")
    
    # Secondary and Micronutrients
    S: float = Field(..., ge=0.0, le=250.0, description="Sulfur content (ppm / mg/kg)")
    zn: float = Field(..., ge=0.0, le=60.0, description="Zinc content (ppm / mg/kg)")
    fe: float = Field(..., ge=0.0, le=150.0, description="Iron content (ppm / mg/kg)")
    cu: float = Field(..., ge=0.0, le=60.0, description="Copper content (ppm / mg/kg)")
    Mn: float = Field(..., ge=0.0, le=120.0, description="Manganese content (ppm / mg/kg)")
    B: float = Field(..., ge=0.0, le=60.0, description="Boron content (ppm / mg/kg)")

class PredictionProbabilities(BaseModel):
    Less_Fertile: float = Field(alias="Less Fertile")
    Fertile: float
    Highly_Fertile: float = Field(alias="Highly Fertile")

    class Config:
        populate_by_name = True

class NutrientEvaluation(BaseModel):
    name: str
    symbol: str
    value: float
    unit: str
    status: str  # "Deficient", "Low", "Optimal", "High", "Excessive"
    optimal_range: str
    impact: str

class PredictionResponse(BaseModel):
    status: str
    id: Optional[int] = None
    sample_name: str
    created_at: str
    fertility_class: int
    fertility_label: str
    confidence: float
    probabilities: Dict[str, float]
    readings: Dict[str, float]
    nutrient_evaluations: List[NutrientEvaluation]
    summary: str

class SoilSampleSummary(BaseModel):
    id: int
    sample_name: str
    created_at: str
    fertility_class: int
    fertility_label: str
    confidence: float
    ph: float
    N: float
    P: float
    K: float
    is_demo: bool

class CompareRequest(BaseModel):
    sample_ids: List[int] = Field(..., min_length=2, max_length=5)

class CropSuitability(BaseModel):
    crop_name: str
    category: str
    suitability_score: int
    suitability_level: str  # "High", "Moderate", "Marginal"
    ideal_ph: str
    nutrient_match: str
    recommendation: str

class SoilRemediationItem(BaseModel):
    parameter: str
    condition: str
    severity: str  # "Critical", "Moderate", "Mild"
    cause: str
    conventional_remedy: str
    organic_remedy: str
    monitoring_advice: str

class ModelEvaluationMetrics(BaseModel):
    model_name: str
    version: str
    dataset_info: Dict[str, Any]
    train_test_split: str
    accuracy: float
    macro_precision: float
    macro_recall: float
    macro_f1: float
    classification_report: Dict[str, Any]
    confusion_matrix: List[List[int]]
    feature_importances: List[Dict[str, Any]]
    multi_model_benchmark: List[Dict[str, Any]]

