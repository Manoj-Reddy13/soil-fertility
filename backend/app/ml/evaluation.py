import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, classification_report
from backend.app.core.config import settings
from backend.app.ml.preprocessing import prepare_input_dataframe

_evaluation_cache = None

def compute_model_evaluations():
    global _evaluation_cache
    if _evaluation_cache is not None:
        return _evaluation_cache

    dataset_path = settings.DATASET_FILE
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}")

    df = pd.read_csv(dataset_path)
    labels = df["fertility"]
    features = df.drop("fertility", axis=1)

    transformed = prepare_input_dataframe(features)
    X_train, X_test, y_train, y_test = train_test_split(
        transformed, labels, test_size=0.2, shuffle=True, random_state=42
    )

    # 1. Main Random Forest evaluation
    rf = RandomForestClassifier(
        criterion="gini", max_depth=10, max_features="sqrt", n_estimators=300, random_state=42
    )
    rf.fit(X_train, y_train)
    rf_preds = rf.predict(X_test)

    rf_acc = float(accuracy_score(y_test, rf_preds))
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, rf_preds, average="macro")
    cm = confusion_matrix(y_test, rf_preds).tolist()
    cr = classification_report(y_test, rf_preds, output_dict=True)

    # 2. Multi-Model Benchmark Comparison
    models_to_compare = [
        ("Random Forest", RandomForestClassifier(n_estimators=300, max_depth=10, random_state=42)),
        ("Support Vector Machine (SVC)", SVC(random_state=42)),
        ("Decision Tree", DecisionTreeClassifier(max_depth=10, random_state=42)),
        ("K-Nearest Neighbors (KNN)", KNeighborsClassifier(n_neighbors=5)),
        ("Gaussian Naive Bayes", GaussianNB())
    ]

    benchmark_results = []
    for name, model in models_to_compare:
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        acc = float(accuracy_score(y_test, preds))
        p, r, f, _ = precision_recall_fscore_support(y_test, preds, average="macro")
        benchmark_results.append({
            "model_name": name,
            "accuracy": round(acc * 100, 2),
            "macro_precision": round(float(p) * 100, 2),
            "macro_recall": round(float(r) * 100, 2),
            "macro_f1": round(float(f) * 100, 2)
        })

    # Sort benchmark by accuracy descending
    benchmark_results.sort(key=lambda x: x["accuracy"], reverse=True)

    _evaluation_cache = {
        "model_name": "Random Forest Classifier (Ensemble)",
        "version": "1.2.0",
        "dataset_info": {
            "source": "Kaggle Soil Fertility Dataset (Modified/Balanced)",
            "total_instances": len(df),
            "features_count": 12,
            "classes": ["0: Less Fertile", "1: Fertile", "2: Highly Fertile"],
            "class_counts": df["fertility"].value_counts().to_dict()
        },
        "train_test_split": "80% Training (1030 samples) / 20% Testing (258 samples)",
        "accuracy": round(rf_acc * 100, 2),
        "macro_precision": round(float(precision) * 100, 2),
        "macro_recall": round(float(recall) * 100, 2),
        "macro_f1": round(float(f1) * 100, 2),
        "classification_report": cr,
        "confusion_matrix": cm,
        "multi_model_benchmark": benchmark_results
    }
    return _evaluation_cache

