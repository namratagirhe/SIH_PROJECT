import os
import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List

DEFAULT_PIPELINE_PATH = "ml/models/mastitis_pipeline.joblib"
DEFAULT_METADATA_PATH = "ml/models/model_metadata.json"

class MastitisPredictor:
    def __init__(self, pipeline_path: str = DEFAULT_PIPELINE_PATH, metadata_path: str = DEFAULT_METADATA_PATH):
        if not os.path.exists(pipeline_path):
            raise FileNotFoundError(f"Model pipeline not found at {pipeline_path}. Run training first!")
        self.pipeline = joblib.load(pipeline_path)
        
        self.metadata = {}
        if os.path.exists(metadata_path):
            with open(metadata_path, "r") as f:
                self.metadata = json.load(f)
                
        self.version = self.metadata.get("model_version", "1.0.0")

    def _extract_contributing_factors(self, input_data: Dict[str, Any]) -> List[str]:
        """
        Extracts farmer-entered affirmative symptoms that contribute to mastitis risk.
        Does not invent symptoms not provided by farmer.
        """
        factors = []
        
        # Milk observations
        prod = str(input_data.get("milk_production", "")).lower()
        if prod in ["decreased", "reduced", "low"]:
            factors.append("Reduced milk production")
            
        if input_data.get("abnormal_milk") in [True, "Yes", "yes", 1]:
            factors.append("Abnormal milk appearance")
            
        if input_data.get("clots_flakes") in [True, "Yes", "yes", 1]:
            factors.append("Clots/flakes observed in milk")
            
        if input_data.get("watery_milk") in [True, "Yes", "yes", 1]:
            factors.append("Watery/thin milk consistency")
            
        if input_data.get("color_change") in [True, "Yes", "yes", 1]:
            factors.append("Discolored milk")
            
        # Udder observations
        if input_data.get("udder_swelling") in [True, "Yes", "yes", 1]:
            factors.append("Udder swelling")
            
        if input_data.get("udder_heat") in [True, "Yes", "yes", 1]:
            factors.append("Udder warm/hot to touch")
            
        if input_data.get("udder_pain") in [True, "Yes", "yes", 1]:
            factors.append("Udder pain/sensitivity during touching")
            
        if input_data.get("udder_redness") in [True, "Yes", "yes", 1]:
            factors.append("Udder skin redness/inflammation")
            
        if input_data.get("udder_hardness") in [True, "Yes", "yes", 1]:
            factors.append("Udder quarter hardness/induration")
            
        if input_data.get("previous_mastitis") in [True, "Yes", "yes", 1]:
            factors.append("Previous history of mastitis")
            
        return factors

    def predict(self, farmer_input: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes single farmer input record and returns risk score, risk level,
        contributing factors, and veterinary recommendation.
        """
        # Format dictionary into single-row DataFrame
        df_single = pd.DataFrame([farmer_input])
        
        # Ensure default values for missing keys
        for key in ["species", "breed", "previous_mastitis", "milk_production",
                    "abnormal_milk", "clots_flakes", "watery_milk", "color_change",
                    "udder_swelling", "udder_heat", "udder_pain", "udder_redness", "udder_hardness"]:
            if key not in df_single.columns:
                df_single[key] = "No" if "milk" in key or "udder" in key else "Don't Know"
                
        if "age" not in df_single.columns:
            df_single["age"] = 5
        if "lactation" not in df_single.columns:
            df_single["lactation"] = 3
            
        # Compute probability
        if hasattr(self.pipeline, "predict_proba"):
            prob = float(self.pipeline.predict_proba(df_single)[0, 1])
        else:
            prob = float(self.pipeline.predict(df_single)[0])
            
        risk_score = round(prob * 100, 1)
        
        # Risk level determination based on validation threshold bounds
        if risk_score < 35.0:
            risk_level = "low"
            recommendation = "Continue routine udder hygiene and daily monitoring."
        elif risk_score < 65.0:
            risk_level = "medium"
            recommendation = "Elevated risk detected. Closely monitor milk yield and conduct California Mastitis Test (CMT) or consult local vet."
        else:
            risk_level = "high"
            recommendation = "High mastitis risk indicated. Veterinary examination and appropriate diagnostic testing are strongly recommended."
            
        contributing_factors = self._extract_contributing_factors(farmer_input)
        
        return {
            "prediction": "mastitis_risk",
            "risk_score": risk_score,
            "risk_level": risk_level,
            "contributing_factors": contributing_factors,
            "recommendation": recommendation,
            "disclaimer": "This early-warning assessment estimates risk based on farmer observations and is NOT a definitive veterinary diagnosis.",
            "model_version": self.version
        }
