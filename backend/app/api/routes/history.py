from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.app.models.database import get_db
from backend.app.models.soil_sample import SoilSample
from backend.app.schemas.soil import CompareRequest, REQUIRED_FEATURES
from backend.app.services.report_service import generate_csv_export, build_comprehensive_report
from backend.app.services.recommendation_service import evaluate_nutrients

router = APIRouter(prefix="", tags=["History & Reports"])

def seed_demo_data_if_empty(db: Session):
    count = db.query(SoilSample).count()
    if count == 0:
        demo_records = [
            SoilSample(
                sample_name="North Orchard Block (Demo)",
                created_at=datetime.utcnow(),
                N=340.0, P=28.5, K=520.0, ph=7.2, ec=0.75, oc=1.1,
                S=14.0, zn=1.2, fe=5.5, cu=0.85, Mn=8.4, B=1.1,
                fertility_class=2, fertility_label="Highly Fertile", confidence=99.2,
                prob_less_fertile=0.1, prob_fertile=0.7, prob_highly_fertile=99.2,
                notes="Rich alluvial soil under drip irrigation and green manure rotation.",
                is_demo=True
            ),
            SoilSample(
                sample_name="South Wheat Field #4 (Demo)",
                created_at=datetime.utcnow(),
                N=265.0, P=14.2, K=290.0, ph=6.8, ec=0.6, oc=0.68,
                S=11.5, zn=0.75, fe=3.8, cu=0.45, Mn=5.2, B=0.65,
                fertility_class=1, fertility_label="Fertile", confidence=94.1,
                prob_less_fertile=3.5, prob_fertile=94.1, prob_highly_fertile=2.4,
                notes="Standard medium loam field ready for Rabi season crop sowing.",
                is_demo=True
            ),
            SoilSample(
                sample_name="Eastern Plateau Hillside (Demo)",
                created_at=datetime.utcnow(),
                N=145.0, P=6.8, K=180.0, ph=5.4, ec=0.35, oc=0.32,
                S=6.2, zn=0.35, fe=1.8, cu=0.22, Mn=3.1, B=0.25,
                fertility_class=0, fertility_label="Less Fertile", confidence=96.4,
                prob_less_fertile=96.4, prob_fertile=2.8, prob_highly_fertile=0.8,
                notes="Eroded slope with nutrient wash-out and low organic carbon.",
                is_demo=True
            )
        ]
        db.add_all(demo_records)
        db.commit()

@router.get("/history")
def get_history(
    search: Optional[str] = None,
    fertility: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    seed_demo_data_if_empty(db)
    query = db.query(SoilSample)

    if isinstance(search, str) and search.strip():
        term = search.strip()
        query = query.filter(
            (SoilSample.sample_name.ilike(f"%{term}%")) |
            (SoilSample.notes.ilike(f"%{term}%"))
        )
    if isinstance(fertility, str) and fertility.strip() and fertility != "All":
        query = query.filter(SoilSample.fertility_label == fertility.strip())

    total_count = query.count()
    samples = query.order_by(desc(SoilSample.created_at)).offset(offset).limit(limit).all()

    return {
        "status": "success",
        "total": total_count,
        "offset": offset,
        "limit": limit,
        "samples": [s.to_dict() for s in samples]
    }

@router.get("/history/{sample_id}")
def get_history_detail(sample_id: int, db: Session = Depends(get_db)):
    sample = db.query(SoilSample).filter(SoilSample.id == sample_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail=f"Soil sample #{sample_id} not found")
    report = build_comprehensive_report(sample)
    return {"status": "success", "sample": report}

@router.delete("/history/{sample_id}")
def delete_sample(sample_id: int, db: Session = Depends(get_db)):
    sample = db.query(SoilSample).filter(SoilSample.id == sample_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail=f"Soil sample #{sample_id} not found")
    db.delete(sample)
    db.commit()
    return {"status": "success", "message": f"Sample #{sample_id} successfully deleted"}

@router.post("/history/compare")
def compare_samples(payload: CompareRequest, db: Session = Depends(get_db)):
    samples = db.query(SoilSample).filter(SoilSample.id.in_(payload.sample_ids)).all()
    if len(samples) < 2:
        raise HTTPException(status_code=400, detail="At least 2 valid sample records are required for comparison.")

    # Prepare comparison matrix
    comparison_data = []
    for s in samples:
        readings = {feat: getattr(s, feat) for feat in REQUIRED_FEATURES}
        evals = evaluate_nutrients(readings)
        comparison_data.append({
            "id": s.id,
            "sample_name": s.sample_name,
            "created_at": s.created_at.strftime("%Y-%m-%d %H:%M") if s.created_at else "",
            "fertility_label": s.fertility_label,
            "fertility_class": s.fertility_class,
            "confidence": s.confidence,
            "readings": readings,
            "nutrient_evaluations": [e.dict() for e in evals]
        })

    # Compute parameter min/max/diff across selected samples
    feature_diffs = {}
    for feat in REQUIRED_FEATURES:
        vals = [getattr(s, feat) for s in samples]
        feature_diffs[feat] = {
            "min": round(min(vals), 2),
            "max": round(max(vals), 2),
            "delta": round(max(vals) - min(vals), 2)
        }

    return {
        "status": "success",
        "sample_count": len(samples),
        "samples": comparison_data,
        "feature_diffs": feature_diffs
    }

@router.get("/export/csv")
def export_history_csv(db: Session = Depends(get_db)):
    samples = db.query(SoilSample).order_by(desc(SoilSample.created_at)).all()
    csv_str = generate_csv_export(samples)
    filename = f"soilsense_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/export/{sample_id}")
def export_sample_report(sample_id: int, db: Session = Depends(get_db)):
    sample = db.query(SoilSample).filter(SoilSample.id == sample_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")
    report = build_comprehensive_report(sample)
    return {"status": "success", "report": report}
