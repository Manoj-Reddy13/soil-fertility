from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.models.database import get_db
from backend.app.models.soil_sample import SoilSample
from backend.app.schemas.soil import REQUIRED_FEATURES
from backend.app.services.recommendation_service import get_crop_recommendations, get_soil_remediation_plan, evaluate_nutrients

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

class RecommendationRequest(BaseModel):
    sample_id: Optional[int] = None
    readings: Optional[Dict[str, float]] = None
    fertility_class: Optional[int] = 1

def _extract_readings_and_fertility(payload: RecommendationRequest, db: Session):
    if payload.sample_id:
        sample = db.query(SoilSample).filter(SoilSample.id == payload.sample_id).first()
        if not sample:
            raise HTTPException(status_code=404, detail="Sample not found")
        readings = {feat: getattr(sample, feat) for feat in REQUIRED_FEATURES}
        fertility = sample.fertility_class
        name = sample.sample_name
    elif payload.readings:
        missing = [f for f in REQUIRED_FEATURES if f not in payload.readings]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing features: {missing}")
        readings = {f: float(payload.readings[f]) for f in REQUIRED_FEATURES}
        fertility = payload.fertility_class if payload.fertility_class is not None else 1
        name = "Custom Readings"
    else:
        raise HTTPException(status_code=400, detail="Provide either sample_id or readings dictionary")
    return readings, fertility, name

@router.post("/crops")
def recommend_crops(payload: RecommendationRequest, db: Session = Depends(get_db)):
    readings, fertility, name = _extract_readings_and_fertility(payload, db)
    crops = get_crop_recommendations(readings, fertility)
    return {
        "status": "success",
        "sample_name": name,
        "fertility_class": fertility,
        "recommendations": [c.dict() for c in crops]
    }

@router.post("/soil-improvement")
def recommend_improvement(payload: RecommendationRequest, db: Session = Depends(get_db)):
    readings, _, name = _extract_readings_and_fertility(payload, db)
    plan = get_soil_remediation_plan(readings)
    evals = evaluate_nutrients(readings)
    return {
        "status": "success",
        "sample_name": name,
        "issues_detected_count": len(plan),
        "remediation_plan": [p.dict() for p in plan],
        "nutrient_evaluations": [e.dict() for e in evals]
    }

