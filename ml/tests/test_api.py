import pytest
from fastapi.testclient import TestClient
from ml.api.main import app

client = TestClient(app)

def test_api_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "model_loaded" in data

def test_api_model_info_endpoint():
    response = client.get("/model-info")
    assert response.status_code in [200, 404]

def test_api_predict_endpoint():
    payload = {
        "species": "Buffalo",
        "age": 5,
        "breed": "Murrah",
        "previous_mastitis": "Yes",
        "lactation": 3,
        "milk_production": "decreased",
        "abnormal_milk": True,
        "clots_flakes": True,
        "watery_milk": False,
        "color_change": False,
        "udder_swelling": True,
        "udder_heat": "Yes",
        "udder_pain": "No",
        "udder_redness": False,
        "udder_hardness": True
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "mastitis_risk"
    assert "risk_score" in data
    assert data["risk_level"] in ["low", "medium", "high"]
    assert isinstance(data["contributing_factors"], list)
