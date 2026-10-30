from fastapi import APIRouter
from backend.app.ml.model_loader import model_manager
from backend.app.ml.evaluation import compute_model_evaluations

router = APIRouter(prefix="", tags=["Model Insights"])

@router.get("/model-info")
def get_model_information():
    """
    Returns actual, live evaluated model metrics, classification report,
    confusion matrix, feature importances, and multi-model comparison.
    """
    eval_data = compute_model_evaluations()
    feature_importances = model_manager.get_feature_importances()

    return {
        "status": "success",
        "model_name": eval_data["model_name"],
        "version": eval_data["version"],
        "dataset_info": eval_data["dataset_info"],
        "train_test_split": eval_data["train_test_split"],
        "accuracy": eval_data["accuracy"],
        "macro_precision": eval_data["macro_precision"],
        "macro_recall": eval_data["macro_recall"],
        "macro_f1": eval_data["macro_f1"],
        "classification_report": eval_data["classification_report"],
        "confusion_matrix": eval_data["confusion_matrix"],
        "feature_importances": feature_importances,
        "multi_model_benchmark": eval_data["multi_model_benchmark"],
        "limitations": [
            "Dataset represents soil elemental analysis from surveyed agricultural plots; localized microclimates and soil depth may alter field performance.",
            "Pre-trained Random Forest model utilizes Log10 scaling to normalize skewed elemental distributions; zero values are safely clamped.",
            "Crop recommendations are governed by transparent agronomic tolerance rules rather than opaque end-to-end blackbox models."
        ]
    }

