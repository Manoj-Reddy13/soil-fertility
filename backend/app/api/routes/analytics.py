from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.models.database import get_db
from backend.app.models.soil_sample import SoilSample
from backend.app.api.routes.history import seed_demo_data_if_empty
from backend.app.schemas.soil import REQUIRED_FEATURES
from backend.app.services.recommendation_service import AGRONOMIC_THRESHOLDS

router = APIRouter(prefix="", tags=["Analytics"])

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    seed_demo_data_if_empty(db)
    samples = db.query(SoilSample).all()
    total_count = len(samples)

    if total_count == 0:
        return {
            "status": "success",
            "kpis": {
                "total_samples": 0,
                "highly_fertile": 0,
                "fertile": 0,
                "less_fertile": 0,
                "avg_ph": 7.0,
                "avg_oc": 0.5
            },
            "fertility_distribution": [],
            "nutrient_averages": [],
            "deficiency_stats": []
        }

    # Counts by fertility
    highly_fertile = sum(1 for s in samples if s.fertility_class == 2)
    fertile = sum(1 for s in samples if s.fertility_class == 1)
    less_fertile = sum(1 for s in samples if s.fertility_class == 0)

    # Average readings
    avg_readings = {}
    for feat in REQUIRED_FEATURES:
        avg_readings[feat] = round(sum(getattr(s, feat) for s in samples) / total_count, 2)

    # Deficiency counts based on agronomic thresholds
    deficiency_stats = []
    for feat, info in AGRONOMIC_THRESHOLDS.items():
        low_limit = info["low"]
        deficient_count = sum(1 for s in samples if getattr(s, feat) < low_limit)
        optimal_count = sum(1 for s in samples if low_limit <= getattr(s, feat) <= info["high"])
        excess_count = sum(1 for s in samples if getattr(s, feat) > info["high"])

        deficiency_stats.append({
            "feature": feat,
            "name": info["name"],
            "unit": info["unit"],
            "deficient_pct": round((deficient_count / total_count) * 100, 1),
            "optimal_pct": round((optimal_count / total_count) * 100, 1),
            "excess_pct": round((excess_count / total_count) * 100, 1)
        })

    fertility_distribution = [
        {"name": "Highly Fertile", "value": highly_fertile, "color": "#10b981"},
        {"name": "Fertile", "value": fertile, "color": "#f59e0b"},
        {"name": "Less Fertile", "value": less_fertile, "color": "#ef4444"}
    ]

    nutrient_averages = [
        {"nutrient": "N (Nitrogen)", "value": avg_readings["N"], "benchmark": 350.0, "unit": "kg/ha"},
        {"nutrient": "P (Phosphorus)", "value": avg_readings["P"], "benchmark": 18.0, "unit": "kg/ha"},
        {"nutrient": "K (Potassium)", "value": avg_readings["K"], "benchmark": 220.0, "unit": "kg/ha"},
        {"nutrient": "S (Sulfur)", "value": avg_readings["S"], "benchmark": 15.0, "unit": "ppm"},
        {"nutrient": "Zn (Zinc)", "value": avg_readings["zn"], "benchmark": 1.0, "unit": "ppm"},
        {"nutrient": "Fe (Iron)", "value": avg_readings["fe"], "benchmark": 7.0, "unit": "ppm"}
    ]

    # Timeline (last 10 samples ordered chronologically)
    recent_chronological = sorted(samples[-10:], key=lambda s: s.created_at)
    timeline = [
        {
            "id": s.id,
            "sample_name": s.sample_name,
            "date": s.created_at.strftime("%b %d") if s.created_at else "",
            "fertility_label": s.fertility_label,
            "confidence": s.confidence,
            "ph": s.ph,
            "ec": s.ec,
            "oc": s.oc
        }
        for s in recent_chronological
    ]

    return {
        "status": "success",
        "kpis": {
            "total_samples": total_count,
            "highly_fertile": highly_fertile,
            "fertile": fertile,
            "less_fertile": less_fertile,
            "avg_ph": avg_readings["ph"],
            "avg_oc": avg_readings["oc"],
            "avg_ec": avg_readings["ec"]
        },
        "fertility_distribution": fertility_distribution,
        "nutrient_averages": nutrient_averages,
        "deficiency_stats": deficiency_stats,
        "timeline": timeline
    }

