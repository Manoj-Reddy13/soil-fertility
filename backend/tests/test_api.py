import pytest
from pydantic import ValidationError
from backend.app.main import health_check
from backend.app.models.database import SessionLocal
from backend.app.schemas.soil import SoilInputSchema
from backend.app.api.routes.prediction import predict_soil_fertility, get_presets
from backend.app.api.routes.history import get_history, get_history_detail
from backend.app.api.routes.model_info import get_model_information
from backend.app.api.routes.recommendations import (
    recommend_crops,
    recommend_improvement,
    RecommendationRequest
)

@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def test_health_check():
    res = health_check()
    assert res["status"] == "healthy"
    assert "SoilSense AI" in res["service"]

def test_presets():
    res = get_presets()
    assert res["status"] == "success"
    assert len(res["presets"]) >= 3
    for p in res["presets"]:
        assert "label" in p
        assert "data" in p
        assert "N" in p["data"]

def test_prediction_valid_input(db):
    payload = SoilInputSchema(
        sample_name="Unit Test Plot 1",
        notes="Automated test sample",
        N=339.0, P=31.0, K=540.0, ph=7.35, ec=0.8, oc=1.05,
        S=7.8, zn=1.13, fe=3.25, cu=1.26, Mn=13.99, B=0.44
    )
    res = predict_soil_fertility(payload, db=db)
    assert res.status == "success"
    assert res.fertility_label in ["Less Fertile", "Fertile", "Highly Fertile"]
    assert 0.0 <= res.confidence <= 100.0
    assert len(res.nutrient_evaluations) == 12
    assert "Less Fertile" in res.probabilities
    assert "Fertile" in res.probabilities
    assert "Highly Fertile" in res.probabilities

def test_prediction_schema_validation_missing():
    with pytest.raises(ValidationError):
        # Intentionally missing N and ph
        SoilInputSchema(
            sample_name="Incomplete Sample",
            P=31.0, K=540.0
        )

def test_prediction_schema_validation_out_of_range():
    with pytest.raises(ValidationError):
        # pH must be <= 12.0
        SoilInputSchema(
            sample_name="Out of Range pH",
            N=339.0, P=31.0, K=540.0, ph=15.0, ec=0.8, oc=1.05,
            S=7.8, zn=1.13, fe=3.25, cu=1.26, Mn=13.99, B=0.44
        )

def test_history_list(db):
    res = get_history(limit=10, offset=0, db=db)
    assert res["status"] == "success"
    assert "samples" in res
    assert len(res["samples"]) > 0

def test_model_info():
    res = get_model_information()
    assert res["status"] == "success"
    assert res["accuracy"] >= 85.0
    assert len(res["confusion_matrix"]) == 3
    assert len(res["feature_importances"]) == 12
    assert len(res["multi_model_benchmark"]) >= 5

def test_crop_recommendations(db):
    payload = RecommendationRequest(
        readings={
            "N": 339.0, "P": 31.0, "K": 540.0, "ph": 7.35, "ec": 0.8, "oc": 1.05,
            "S": 7.8, "zn": 1.13, "fe": 3.25, "cu": 1.26, "Mn": 13.99, "B": 0.44
        },
        fertility_class=2
    )
    res = recommend_crops(payload, db=db)
    assert res["status"] == "success"
    assert len(res["recommendations"]) > 0
    first = res["recommendations"][0]
    assert "suitability_score" in first
    assert "crop_name" in first

def test_soil_improvement(db):
    payload = RecommendationRequest(
        readings={
            "N": 120.0, "P": 6.0, "K": 80.0, "ph": 5.2, "ec": 2.2, "oc": 0.3,
            "S": 5.0, "zn": 0.3, "fe": 2.0, "cu": 0.1, "Mn": 1.5, "B": 0.2
        }
    )
    res = recommend_improvement(payload, db=db)
    assert res["status"] == "success"
    assert res["issues_detected_count"] > 0
    assert len(res["remediation_plan"]) > 0
