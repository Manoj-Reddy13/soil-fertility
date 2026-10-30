import io
import csv
from datetime import datetime
from typing import List, Dict, Any
from backend.app.models.soil_sample import SoilSample
from backend.app.schemas.soil import REQUIRED_FEATURES
from backend.app.services.recommendation_service import evaluate_nutrients, get_crop_recommendations, get_soil_remediation_plan

def generate_csv_export(samples: List[SoilSample]) -> str:
    """
    Generates a CSV string containing soil analysis records.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    
    headers = [
        "ID", "Sample Name", "Date", "Fertility Label", "Fertility Class", "Confidence (%)",
        "N (kg/ha)", "P (kg/ha)", "K (kg/ha)", "pH", "EC (dS/m)", "OC (%)",
        "S (ppm)", "Zn (ppm)", "Fe (ppm)", "Cu (ppm)", "Mn (ppm)", "B (ppm)", "Notes"
    ]
    writer.writerow(headers)
    
    for s in samples:
        writer.writerow([
            s.id,
            s.sample_name,
            s.created_at.strftime("%Y-%m-%d %H:%M:%S") if s.created_at else "",
            s.fertility_label,
            s.fertility_class,
            s.confidence,
            s.N, s.P, s.K, s.ph, s.ec, s.oc,
            s.S, s.zn, s.fe, s.cu, s.Mn, s.B,
            s.notes or ""
        ])
    return output.getvalue()

def parse_csv_batch(csv_content: str) -> List[Dict[str, Any]]:
    """
    Parses an uploaded CSV file containing soil readings.
    Validates feature columns and returns list of input dictionaries.
    """
    f = io.StringIO(csv_content)
    reader = csv.DictReader(f)
    samples = []
    
    # Normalize headers
    for idx, row in enumerate(reader, start=1):
        clean_row = {k.strip(): v.strip() for k, v in row.items() if k}
        
        # Check required features (case-insensitive check)
        mapped = {}
        for req in REQUIRED_FEATURES:
            found_key = None
            for k in clean_row:
                if k.lower() == req.lower():
                    found_key = k
                    break
            if not found_key:
                raise ValueError(f"Row {idx}: Missing required soil column '{req}'")
            try:
                mapped[req] = float(clean_row[found_key])
            except ValueError:
                raise ValueError(f"Row {idx}: Invalid numeric value '{clean_row[found_key]}' for feature '{req}'")
        
        sample_name = clean_row.get("Sample Name", clean_row.get("sample_name", f"Batch Sample #{idx}"))
        notes = clean_row.get("Notes", clean_row.get("notes", "Uploaded via CSV batch"))
        mapped["sample_name"] = sample_name
        mapped["notes"] = notes
        samples.append(mapped)
    
    if not samples:
        raise ValueError("Uploaded CSV file contains no data rows.")
    return samples

def build_comprehensive_report(sample: SoilSample) -> Dict[str, Any]:
    """
    Builds a full structured report for a soil sample including readings, evaluations,
    crop recommendations, and remediation advice.
    """
    readings = {
        "N": sample.N, "P": sample.P, "K": sample.K,
        "ph": sample.ph, "ec": sample.ec, "oc": sample.oc,
        "S": sample.S, "zn": sample.zn, "fe": sample.fe,
        "cu": sample.cu, "Mn": sample.Mn, "B": sample.B
    }
    evaluations = evaluate_nutrients(readings)
    crops = get_crop_recommendations(readings, sample.fertility_class)
    remediation = get_soil_remediation_plan(readings)

    return {
        "report_id": f"SOIL-{sample.id:05d}",
        "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "sample_info": {
            "id": sample.id,
            "sample_name": sample.sample_name,
            "created_at": sample.created_at.strftime("%Y-%m-%d %H:%M:%S") if sample.created_at else "",
            "notes": sample.notes or "None provided"
        },
        "fertility_prediction": {
            "class_index": sample.fertility_class,
            "label": sample.fertility_label,
            "confidence": sample.confidence,
            "probabilities": {
                "Less Fertile": sample.prob_less_fertile,
                "Fertile": sample.prob_fertile,
                "Highly Fertile": sample.prob_highly_fertile
            }
        },
        "readings": readings,
        "nutrient_evaluations": [e.dict() for e in evaluations],
        "top_crop_recommendations": [c.dict() for c in crops[:5]],
        "remediation_plan": [r.dict() for r in remediation]
    }

