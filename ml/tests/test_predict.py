import pytest
from ml.src.predict import MastitisPredictor

@pytest.fixture
def predictor():
    return MastitisPredictor()

def test_low_risk_prediction(predictor):
    low_risk_input = {
        "species": "Cow",
        "age": 4,
        "breed": "Holstein",
        "previous_mastitis": "No",
        "lactation": 2,
        "milk_production": "normal",
        "abnormal_milk": False,
        "clots_flakes": False,
        "watery_milk": False,
        "color_change": False,
        "udder_swelling": False,
        "udder_heat": "No",
        "udder_pain": "No",
        "udder_redness": False,
        "udder_hardness": False
    }
    result = predictor.predict(low_risk_input)
    assert result["prediction"] == "mastitis_risk"
    assert isinstance(result["risk_score"], float)
    assert result["risk_level"] in ["low", "medium", "high"]

def test_high_risk_prediction(predictor):
    high_risk_input = {
        "species": "Cow",
        "age": 7,
        "breed": "Jersey",
        "previous_mastitis": "Yes",
        "lactation": 4,
        "milk_production": "decreased",
        "abnormal_milk": True,
        "clots_flakes": True,
        "watery_milk": True,
        "color_change": True,
        "udder_swelling": True,
        "udder_heat": "Yes",
        "udder_pain": "Yes",
        "udder_redness": True,
        "udder_hardness": True
    }
    result = predictor.predict(high_risk_input)
    assert result["risk_score"] > 50.0
    assert result["risk_level"] in ["medium", "high"]
    assert len(result["contributing_factors"]) > 0
    assert "Veterinary" in result["recommendation"]
