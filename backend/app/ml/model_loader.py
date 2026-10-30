import os
import pickle
import logging
from typing import Tuple, List, Dict, Any
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from backend.app.core.config import settings
from backend.app.ml.preprocessing import REQUIRED_FEATURES, prepare_input_dataframe

logger = logging.getLogger(__name__)

CATEGORIES = ["Less Fertile", "Fertile", "Highly Fertile"]

class ModelManager:
    _instance = None
    _model = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self.categories = CATEGORIES
        self.features = REQUIRED_FEATURES
        self.model = self._load_or_train_model()

    def _load_or_train_model(self):
        model_path = settings.MODEL_FILE
        if os.path.exists(model_path):
            try:
                with open(model_path, "rb") as f:
                    loaded = pickle.load(f)
                # Verify predict capability
                dummy = prepare_input_dataframe({f: 10.0 for f in self.features})
                loaded.predict(dummy)
                logger.info(f"Loaded existing model from {model_path}")
                return loaded
            except Exception as e:
                logger.warning(f"Failed to load pickled model ({e}). Re-training fresh model...")
        else:
            logger.info("Model file not found. Training fresh Random Forest model...")

        return self._train_fresh_model()

    def _train_fresh_model(self):
        dataset_path = settings.DATASET_FILE
        if not os.path.exists(dataset_path):
            raise FileNotFoundError(f"Cannot train model: dataset not found at {dataset_path}")

        df = pd.read_csv(dataset_path)
        labels = df["fertility"]
        features = df.drop("fertility", axis=1)

        transformed = prepare_input_dataframe(features)
        X_train, _, y_train, _ = train_test_split(
            transformed, labels, test_size=0.2, shuffle=True, random_state=42
        )

        model = RandomForestClassifier(
            criterion="gini",
            max_depth=10,
            max_features="sqrt",
            n_estimators=300,
            random_state=42
        )
        model.fit(X_train, y_train)

        # Save to disk
        try:
            with open(settings.MODEL_FILE, "wb") as f:
                pickle.dump(model, f)
            logger.info(f"Saved freshly trained model to {settings.MODEL_FILE}")
        except Exception as err:
            logger.error(f"Could not save model to {settings.MODEL_FILE}: {err}")

        return model

    def predict(self, input_dict: Dict[str, float]) -> Tuple[int, str, float, Dict[str, float]]:
        """
        Runs model prediction on single input sample.
        Returns:
            (class_index, class_label, confidence_pct, dict_of_probabilities)
        """
        scaled_df = prepare_input_dataframe(input_dict)
        pred_idx = int(self.model.predict(scaled_df)[0])
        probs = self.model.predict_proba(scaled_df)[0]
        
        confidence = round(float(probs[pred_idx]) * 100, 2)
        prob_dict = {
            self.categories[i]: round(float(probs[i]) * 100, 2)
            for i in range(len(self.categories))
        }
        return pred_idx, self.categories[pred_idx], confidence, prob_dict

    def get_feature_importances(self) -> List[Dict[str, Any]]:
        """
        Returns feature importances from the Random Forest model.
        """
        if hasattr(self.model, "feature_importances_"):
            importances = self.model.feature_importances_
            named = [
                {
                    "feature": feat,
                    "importance": round(float(importances[i]) * 100, 2),
                    "description": self._get_feature_description(feat)
                }
                for i, feat in enumerate(self.features)
            ]
            named.sort(key=lambda x: x["importance"], reverse=True)
            return named
        return []

    def _get_feature_description(self, feat: str) -> str:
        descriptions = {
            "N": "Nitrogen content (vegetative growth & chlorophyll)",
            "P": "Phosphorus content (root development & flowering)",
            "K": "Potassium content (disease resistance & fruit quality)",
            "ph": "Soil acidity / alkalinity balance",
            "ec": "Electrical conductivity (salinity index)",
            "oc": "Organic carbon (soil biological vitality & structure)",
            "S": "Sulfur (amino acids & protein synthesis)",
            "zn": "Zinc (enzyme systems & growth hormone production)",
            "fe": "Iron (chlorophyll synthesis & respiration)",
            "cu": "Copper (photosynthesis & seed production)",
            "Mn": "Manganese (nitrogen metabolism & oxygen evolution)",
            "B": "Boron (cell wall formation & reproductive health)"
        }
        return descriptions.get(feat, feat)

model_manager = ModelManager.get_instance()

