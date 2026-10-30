from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from backend.app.models.database import get_db
from backend.app.models.soil_sample import SoilSample
from backend.app.schemas.soil import SoilInputSchema, PredictionResponse, REQUIRED_FEATURES
from backend.app.ml.model_loader import model_manager
from backend.app.services.recommendation_service import evaluate_nutrients
from backend.app.services.report_service import parse_csv_batch

router = APIRouter(prefix="", tags=["Prediction"])

DEMO_PRESETS = [
    {
        "label": "Low Fertility Sample (Deficient NPK & Trace Minerals)",
        "fertility_expected": "Less Fertile",
        "data": {
            "sample_name": "Marginal Dryland Lot #14",
            "notes": "Low organic matter, coarse sandy soil, low nitrogen",
            "N": 138.0, "P": 8.6, "K": 560.0, "ph": 7.46, "ec": 0.62, "oc": 0.70,
            "S": 5.9, "zn": 0.24, "fe": 0.31, "cu": 0.77, "Mn": 8.71, "B": 0.11
        }
    },
    {
        "label": "Medium Fertility Sample (Balanced Moderate NPK)",
        "fertility_expected": "Fertile",
        "data": {
            "sample_name": "Valley Loam Plot B",
            "notes": "Regularly farmed alluvial loam with moderate fertilization",
            "N": 270.0, "P": 9.9, "K": 444.0, "ph": 7.63, "ec": 0.40, "oc": 0.86,
            "S": 11.8, "zn": 0.25, "fe": 0.76, "cu": 1.69, "Mn": 2.43, "B": 2.26
        }
    },
    {
        "label": "High Fertility Sample (Optimal Nutrients & High Micronutrients)",
        "fertility_expected": "Highly Fertile",
        "data": {
            "sample_name": "River Basin Orchard Block 3",
            "notes": "Rich humus topsoil, compost amended, excellent micronutrient balance",
            "N": 339.0, "P": 31.0, "K": 540.0, "ph": 7.35, "ec": 0.80, "oc": 1.05,
            "S": 7.8, "zn": 1.13, "fe": 3.25, "cu": 1.26, "Mn": 13.99, "B": 0.44
        }
    }
]

@router.get("/presets")
def get_presets():
    """Returns verified demonstration samples from the dataset."""
    return {"status": "success", "presets": DEMO_PRESETS}

@router.post("/predict", response_model=PredictionResponse)
def predict_soil_fertility(payload: SoilInputSchema, db: Session = Depends(get_db)):
    """
    Validates the 12 elemental soil analysis parameters, applies the model's exact Log10 scaling,
    runs the Random Forest model, records the sample in the database, and returns evaluations.
    """
    input_data = payload.dict()
    readings = {feat: float(input_data[feat]) for feat in REQUIRED_FEATURES}
    
    try:
        class_idx, label, confidence, prob_dict = model_manager.predict(readings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

    evaluations = evaluate_nutrients(readings)

    # Save record to database
    db_sample = SoilSample(
        sample_name=payload.sample_name or "Soil Sample",
        created_at=datetime.utcnow(),
        N=readings["N"], P=readings["P"], K=readings["K"],
        ph=readings["ph"], ec=readings["ec"], oc=readings["oc"],
        S=readings["S"], zn=readings["zn"], fe=readings["fe"],
        cu=readings["cu"], Mn=readings["Mn"], B=readings["B"],
        fertility_class=class_idx,
        fertility_label=label,
        confidence=confidence,
        prob_less_fertile=prob_dict["Less Fertile"],
        prob_fertile=prob_dict["Fertile"],
        prob_highly_fertile=prob_dict["Highly Fertile"],
        notes=payload.notes,
        is_demo=False
    )
    db.add(db_sample)
    db.commit()
    db.refresh(db_sample)

    summary_text = (
        f"Soil sample '{db_sample.sample_name}' classified as {label} with {confidence}% confidence. "
        f"Key soil reaction is pH {readings['ph']:.2f} with EC {readings['ec']:.2f} dS/m."
    )

    return PredictionResponse(
        status="success",
        id=db_sample.id,
        sample_name=db_sample.sample_name,
        created_at=db_sample.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        fertility_class=class_idx,
        fertility_label=label,
        confidence=confidence,
        probabilities=prob_dict,
        readings=readings,
        nutrient_evaluations=evaluations,
        summary=summary_text
    )

@router.post("/predict/batch")
async def batch_predict_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload a CSV file containing multiple soil samples for batch prediction.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files (.csv) are supported.")

    content = await file.read()
    try:
        csv_text = content.decode("utf-8")
        parsed_samples = parse_csv_batch(csv_text)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV processing error: {str(e)}")

    results = []
    for item in parsed_samples:
        readings = {feat: float(item[feat]) for feat in REQUIRED_FEATURES}
        class_idx, label, confidence, prob_dict = model_manager.predict(readings)

        db_sample = SoilSample(
            sample_name=item["sample_name"],
            created_at=datetime.utcnow(),
            N=readings["N"], P=readings["P"], K=readings["K"],
            ph=readings["ph"], ec=readings["ec"], oc=readings["oc"],
            S=readings["S"], zn=readings["zn"], fe=readings["fe"],
            cu=readings["cu"], Mn=readings["Mn"], B=readings["B"],
            fertility_class=class_idx,
            fertility_label=label,
            confidence=confidence,
            prob_less_fertile=prob_dict["Less Fertile"],
            prob_fertile=prob_dict["Fertile"],
            prob_highly_fertile=prob_dict["Highly Fertile"],
            notes=item.get("notes", "CSV batch import"),
            is_demo=False
        )
        db.add(db_sample)
        db.commit()
        db.refresh(db_sample)

        results.append({
            "id": db_sample.id,
            "sample_name": db_sample.sample_name,
            "fertility_label": label,
            "confidence": confidence,
            "readings": readings
        })

    return {
        "status": "success",
        "total_processed": len(results),
        "results": results
    }

