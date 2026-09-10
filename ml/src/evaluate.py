import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, precision_recall_curve, auc, confusion_matrix
)
from typing import Dict, Any

def evaluate_classifier(model, X_test, y_test, threshold: float = 0.5) -> Dict[str, Any]:
    """
    Evaluates classification metrics for a model pipeline on test data.
    """
    if hasattr(model, "predict_proba"):
        y_probs = model.predict_proba(X_test)[:, 1]
    elif hasattr(model, "decision_function"):
        y_probs = model.decision_function(X_test)
        # Scale to 0-1 range
        y_probs = (y_probs - y_probs.min()) / (y_probs.max() - y_probs.min() + 1e-8)
    else:
        y_probs = model.predict(X_test)
        
    y_preds = (y_probs >= threshold).astype(int)
    
    acc = accuracy_score(y_test, y_preds)
    prec = precision_score(y_test, y_preds, zero_division=0)
    rec = recall_score(y_test, y_preds, zero_division=0)
    f1 = f1_score(y_test, y_preds, zero_division=0)
    
    cm = confusion_matrix(y_test, y_preds)
    tn, fp, fn, tp = cm.ravel()
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
    
    try:
        roc_auc = roc_auc_score(y_test, y_probs)
    except Exception:
        roc_auc = 0.5
        
    p_prec, p_rec, _ = precision_recall_curve(y_test, y_probs)
    pr_auc = auc(p_rec, p_prec)
    
    return {
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "specificity": round(float(specificity), 4),
        "f1_score": round(float(f1), 4),
        "roc_auc": round(float(roc_auc), 4),
        "pr_auc": round(float(pr_auc), 4),
        "confusion_matrix": {"TN": int(tn), "FP": int(fp), "FN": int(fn), "TP": int(tp)}
    }

def create_model_comparison_table(results_dict: Dict[str, Dict[str, Any]], save_path: str = "ml/reports/model_comparison.csv") -> pd.DataFrame:
    """
    Creates and saves model comparison summary CSV.
    """
    rows = []
    for model_name, metrics in results_dict.items():
        rows.append({
            "Model": model_name,
            "Accuracy": metrics["accuracy"],
            "Precision": metrics["precision"],
            "Recall": metrics["recall"],
            "Specificity": metrics["specificity"],
            "F1-Score": metrics["f1_score"],
            "ROC-AUC": metrics["roc_auc"],
            "PR-AUC": metrics["pr_auc"]
        })
        
    df_comp = pd.DataFrame(rows)
    df_comp.sort_values(by="F1-Score", ascending=False, inplace=True)
    if save_path:
        import os
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        df_comp.to_csv(save_path, index=False)
        print(f"Model comparison saved to {save_path}")
    return df_comp
