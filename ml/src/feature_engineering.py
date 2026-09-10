import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin

class SymptomAggregatorTransformer(BaseEstimator, TransformerMixin):
    """
    Custom Scikit-Learn transformer to engineer summary observation scores
    from farmer observations without modifying raw feature definitions.
    """
    def __init__(self):
        pass

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_out = X.copy()
        
        # Count affirmative milk observations
        milk_cols = ["abnormal_milk", "clots_flakes", "watery_milk", "color_change"]
        milk_score = np.zeros(len(X_out))
        for col in milk_cols:
            if col in X_out.columns:
                milk_score += (X_out[col].astype(str).str.lower().isin(["yes", "true", "1"])).astype(int)
        
        # Count affirmative udder observations
        udder_cols = ["udder_swelling", "udder_heat", "udder_pain", "udder_redness", "udder_hardness"]
        udder_score = np.zeros(len(X_out))
        for col in udder_cols:
            if col in X_out.columns:
                udder_score += (X_out[col].astype(str).str.lower().isin(["yes", "true", "1"])).astype(int)
                
        X_out["milk_symptom_score"] = milk_score
        X_out["udder_symptom_score"] = udder_score
        X_out["total_symptom_score"] = milk_score + udder_score
        
        return X_out
