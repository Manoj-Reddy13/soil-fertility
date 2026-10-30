import os
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

def train_model(data_path="Data/Soil Fertility Data (Modified Data).csv", model_output_path="random_forest_pkl.pkl"):
    print("=" * 60)
    print("  Soil Quality & Fertility Prediction - Model Training")
    print("=" * 60)
    
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}")
    
    print(f"\n[1] Loading dataset from: {data_path}")
    df = pd.read_csv(data_path)
    print(f"    Dataset shape: {df.shape[0]} rows, {df.shape[1]} columns")
    
    # Separate features and target
    labels = df['fertility']
    features = df.drop('fertility', axis=1)
    feature_names = list(features.columns)
    print(f"    Features ({len(feature_names)}): {', '.join(feature_names)}")
    print(f"    Class distribution:\n{labels.value_counts().rename({0: '0 (Less Fertile)', 1: '1 (Fertile)', 2: '2 (Highly Fertile)'}).to_string()}")
    
    # Feature Scaling: Log10 transform for skewed elemental features
    print("\n[2] Applying Log10 transform for feature scaling...")
    transformed_features = features.apply(lambda x: np.log10(x) if np.issubdtype(x.dtype, np.number) else x)
    
    # Train / Validation Split (80% train, 20% validation)
    print("\n[3] Splitting dataset (80% train, 20% test)...")
    X_train, X_val, y_train, y_val = train_test_split(
        transformed_features, labels, test_size=0.2, shuffle=True, random_state=42
    )
    print(f"    Train size: {X_train.shape[0]}, Validation size: {X_val.shape[0]}")
    
    # Train RandomForestClassifier with optimal hyperparameters found via GridSearchCV
    print("\n[4] Training RandomForestClassifier (n_estimators=300, max_depth=10, criterion='gini')...")
    clf = RandomForestClassifier(
        n_estimators=300,
        max_depth=10,
        criterion='gini',
        max_features='sqrt',
        random_state=42
    )
    clf.fit(X_train, y_train)
    
    # Evaluation
    print("\n[5] Evaluating model performance...")
    val_preds = clf.predict(X_val)
    acc = accuracy_score(y_val, val_preds)
    print(f"\n>>> Validation Accuracy: {acc * 100:.2f}% <<<\n")
    
    target_names = ["Less Fertile (0)", "Fertile (1)", "Highly Fertile (2)"]
    print("Classification Report:")
    print(classification_report(y_val, val_preds, target_names=target_names))
    
    print("Confusion Matrix:")
    print(confusion_matrix(y_val, val_preds))
    
    # Save the model
    print(f"\n[6] Saving trained model to: {model_output_path}")
    with open(model_output_path, "wb") as f:
        pickle.dump(clf, f)
    print("    Model successfully saved!")
    print("=" * 60)

if __name__ == "__main__":
    train_model()

