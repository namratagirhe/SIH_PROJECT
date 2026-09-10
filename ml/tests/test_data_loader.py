import pytest
import pandas as pd
from ml.src.data_loader import load_raw_dataset, validate_and_extract_features, EXCLUDED_LAB_FEATURES, FARMER_FEATURES

def test_raw_dataset_loading():
    df = load_raw_dataset()
    assert isinstance(df, pd.DataFrame)
    assert len(df) > 0
    assert "mastitis" in df.columns

def test_lab_features_exclusion():
    df = load_raw_dataset()
    X, y = validate_and_extract_features(df)
    
    # Assert no lab/sensor features exist in X
    for lab_feature in EXCLUDED_LAB_FEATURES:
        assert lab_feature not in X.columns
        
    # Assert all X columns are valid farmer features
    for col in X.columns:
        assert col in FARMER_FEATURES
