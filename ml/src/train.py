import os
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

from ml.src.data_loader import load_raw_dataset, validate_and_extract_features, FARMER_FEATURES
from ml.src.preprocessing import build_preprocessing_pipeline, NUMERICAL_FEATURES, CATEGORICAL_FEATURES
from ml.src.feature_engineering import SymptomAggregatorTransformer
from ml.src.evaluate import evaluate_classifier, create_model_comparison_table

def train_and_evaluate_models():
    """
    Main training script. Loads real data, trains 4 models, evaluates metrics,
    selects best pipeline, saves joblib artifact & metadata JSON.
    """
    print("=" * 60)
    print("      BOVINE MASTITIS ML TRAINING PIPELINE      ")
    print("=" * 60)
    
    # 1. Load data
    raw_df = load_raw_dataset()
    X, y = validate_and_extract_features(raw_df)
    
    # 2. Split data (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    print(f"\nTraining set size: {len(X_train)} | Test set size: {len(X_test)}")
    print(f"Class Distribution in Train: {dict(y_train.value_counts())}")
    
    # 3. Base Preprocessor
    preprocessor, existing_num, existing_cat = build_preprocessing_pipeline(X_train)
    
    # 4. Define candidate models
    candidate_models = {
        "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42, class_weight="balanced"),
        "DecisionTree": DecisionTreeClassifier(max_depth=5, random_state=42, class_weight="balanced"),
        "RandomForest": RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42, class_weight="balanced"),
        "GradientBoosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.08, max_depth=4, random_state=42)
    }
    
    results = {}
    fitted_pipelines = {}
    
    print("\nTraining and cross-validating models...")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    for name, clf in candidate_models.items():
        pipeline = Pipeline(steps=[
            ("feature_engineer", SymptomAggregatorTransformer()),
            ("preprocessor", preprocessor),
            ("classifier", clf)
        ])
        
        # 5. Cross-validation
        cv_scores = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring="f1")
        
        # Fit on full training split
        pipeline.fit(X_train, y_train)
        fitted_pipelines[name] = pipeline
        
        # Evaluate on test set
        metrics = evaluate_classifier(pipeline, X_test, y_test, threshold=0.5)
        metrics["cv_f1_mean"] = round(float(np.mean(cv_scores)), 4)
        metrics["cv_f1_std"] = round(float(np.std(cv_scores)), 4)
        
        results[name] = metrics
        print(f" -> {name:<18} | Test F1: {metrics['f1_score']:.4f} | Recall: {metrics['recall']:.4f} | CV F1: {metrics['cv_f1_mean']:.4f}")
        
    # 6. Save comparison CSV
    comp_df = create_model_comparison_table(results, "ml/reports/model_comparison.csv")
    print("\nModel Comparison Table:")
    print(comp_df.to_string(index=False))
    
    # 7. Select best model based on F1 and Recall
    best_model_name = comp_df.iloc[0]["Model"]
    best_pipeline = fitted_pipelines[best_model_name]
    best_metrics = results[best_model_name]
    
    print(f"\nBest Model Selected: {best_model_name}")
    
    # 8. Save Joblib Pipeline
    os.makedirs("ml/models", exist_ok=True)
    pipeline_path = "ml/models/mastitis_pipeline.joblib"
    joblib.dump(best_pipeline, pipeline_path)
    print(f"Saved best pipeline artifact to: {pipeline_path}")
    
    # 9. Save Model Metadata JSON
    metadata = {
        "model_name": best_model_name,
        "dataset_source": "Mendeley Data DOI 10.17632/kbvcdw5b4m.1 & Kaggle Dairy Cattle Mastitis",
        "dataset_version": "1.0.0",
        "features_used": [c for c in FARMER_FEATURES if c in X.columns],
        "excluded_lab_features": ["somatic_cell_count", "milk_conductivity", "milk_ph"],
        "training_date": datetime.now().isoformat(),
        "evaluation_metrics": best_metrics,
        "risk_thresholds": {
            "low_max": 0.35,
            "medium_max": 0.65,
            "high_min": 0.65
        },
        "model_version": "1.0.0"
    }
    
    metadata_path = "ml/models/model_metadata.json"
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved metadata to: {metadata_path}")
    
    print("\nTraining completed successfully!")
    return best_pipeline, metadata

if __name__ == "__main__":
    train_and_evaluate_models()
