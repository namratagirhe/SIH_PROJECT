import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Union

from ml.src.predict import MastitisPredictor, DEFAULT_PIPELINE_PATH, DEFAULT_METADATA_PATH

app = FastAPI(
    title="Bovine Mastitis Early Warning Risk Forecasting Service",
    description="AI-Based Decision Support Service for estimating mastitis risk in cows & buffaloes strictly using non-laboratory farmer observations.",
    version="1.0.0"
)

# Global predictor instance
predictor = None

@app.on_event("startup")
def load_model_on_startup():
    global predictor
    try:
        if not os.path.exists(DEFAULT_PIPELINE_PATH):
            from ml.src.train import train_and_evaluate_models
            print("Pipeline not found. Running training on startup...")
            train_and_evaluate_models()
        predictor = MastitisPredictor()
        print("ML Predictor successfully loaded!")
    except Exception as e:
        print(f"Warning during model initialization: {e}")

class FarmerPredictionInput(BaseModel):
    species: str = Field(..., description="Cow or Buffalo")
    age: Optional[Union[int, float]] = Field(5, description="Age of animal in years")
    breed: str = Field(..., description="Breed of animal")
    previous_mastitis: Union[bool, str] = Field(..., description="Past mastitis history (Yes/No/Don't Know or boolean)")
    lactation: Optional[Union[int, float]] = Field(3, description="Lactation cycle or stage")
    
    milk_production: str = Field("normal", description="Milk yield (normal or decreased)")
    abnormal_milk: Union[bool, str] = Field(False, description="Abnormal milk visual appearance")
    clots_flakes: Union[bool, str] = Field(False, description="Clots or flakes in milk")
    watery_milk: Union[bool, str] = Field(False, description="Watery/thin milk")
    color_change: Union[bool, str] = Field(False, description="Discolored milk")
    
    udder_swelling: Union[bool, str] = Field(False, description="Udder swelling")
    udder_heat: Union[bool, str] = Field("No", description="Udder heat to touch")
    udder_pain: Union[bool, str] = Field("No", description="Udder pain reaction")
    udder_redness: Union[bool, str] = Field(False, description="Udder skin redness")
    udder_hardness: Union[bool, str] = Field(False, description="Udder tissue hardness")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "species": "Cow",
                "age": 6,
                "breed": "Jersey",
                "previous_mastitis": True,
                "lactation": 3,
                "milk_production": "decreased",
                "abnormal_milk": True,
                "clots_flakes": True,
                "watery_milk": False,
                "color_change": False,
                "udder_swelling": True,
                "udder_heat": True,
                "udder_pain": False,
                "udder_redness": False,
                "udder_hardness": True
            }
        }
    )

@app.get("/health")
def health_check():
    global predictor
    is_loaded = predictor is not None and predictor.pipeline is not None
    return {
        "status": "ok",
        "service": "Bovine Mastitis Early Warning ML Backend",
        "model_loaded": is_loaded,
        "version": predictor.version if is_loaded else "1.0.0"
    }

@app.get("/model-info")
def get_model_info():
    if not os.path.exists(DEFAULT_METADATA_PATH):
        raise HTTPException(status_code=404, detail="Model metadata not found.")
    with open(DEFAULT_METADATA_PATH, "r") as f:
        metadata = json.load(f)
    return metadata

@app.post("/predict")
def predict_mastitis_risk(input_data: FarmerPredictionInput):
    global predictor
    if predictor is None:
        try:
            predictor = MastitisPredictor()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to load ML pipeline: {str(e)}")
            
    payload = input_data.model_dump() if hasattr(input_data, "model_dump") else input_data.dict()
    result = predictor.predict(payload)
    return result
