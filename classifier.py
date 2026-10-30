import os
import pickle
import numpy as np
import pandas as pd

CATEGORIES = ["Less Fertile", "Fertile", "Highly Fertile"]
REQUIRED_FEATURES = ["N", "P", "K", "ph", "ec", "oc", "S", "zn", "fe", "cu", "Mn", "B"]

class SoilQualityClassifier:
    """
    Soil Quality and Fertility Classifier.
    Predicts soil fertility category based on 12 elemental soil analysis parameters:
    N, P, K, ph, ec, oc, S, zn, fe, cu, Mn, B.
    """
    def __init__(self, model_path="random_forest_pkl.pkl"):
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model file '{model_path}' not found. Please run train.py first to generate the model."
            )
        with open(model_path, "rb") as f:
            self.model = pickle.load(f)
        self.categories = CATEGORIES
        self.required_features = REQUIRED_FEATURES

    def preprocess(self, input_data):
        """
        Validates input features and applies log10 transformation.
        Accepts dict or pandas DataFrame.
        """
        if isinstance(input_data, dict):
            # Check for missing features
            missing = [feat for feat in self.required_features if feat not in input_data]
            if missing:
                raise ValueError(f"Missing required soil features: {missing}")
            # Ensure proper column order
            df = pd.DataFrame([{k: float(input_data[k]) for k in self.required_features}])
        elif isinstance(input_data, pd.DataFrame):
            df = input_data[self.required_features].astype(float).copy()
        else:
            raise TypeError("input_data must be a dict or pandas DataFrame")

        # Apply log10 scaling matching the training pipeline
        # Handle zero or negative values safely
        df_scaled = df.apply(lambda col: np.log10(np.where(col <= 0, 1e-6, col)))
        return df_scaled

    def predict(self, input_data):
        """
        Returns class indices (0, 1, or 2).
        """
        scaled = self.preprocess(input_data)
        return self.model.predict(scaled)

    def predict_proba(self, input_data):
        """
        Returns prediction probabilities for [Less Fertile, Fertile, Highly Fertile].
        """
        scaled = self.preprocess(input_data)
        return self.model.predict_proba(scaled)

    def compute_prediction(self, input_data):
        """
        Convenience method returning a friendly dictionary with label, class id, and confidence scores.
        """
        try:
            scaled = self.preprocess(input_data)
            pred_idx = int(self.model.predict(scaled)[0])
            probs = self.model.predict_proba(scaled)[0]
            
            return {
                "status": "success",
                "class_index": pred_idx,
                "fertility_status": self.categories[pred_idx],
                "confidence": round(float(probs[pred_idx]) * 100, 2),
                "probabilities": {
                    self.categories[i]: round(float(prob) * 100, 2)
                    for i, prob in enumerate(probs)
                }
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

