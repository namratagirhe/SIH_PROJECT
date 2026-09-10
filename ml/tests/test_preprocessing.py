import pytest
import pandas as pd
from ml.src.data_loader import load_raw_dataset, validate_and_extract_features
from ml.src.preprocessing import build_preprocessing_pipeline

def test_preprocessing_pipeline():
    df = load_raw_dataset()
    X, y = validate_and_extract_features(df)
    
    preprocessor, existing_num, existing_cat = build_preprocessing_pipeline(X)
    assert len(existing_num) > 0
    assert len(existing_cat) > 0
    
    transformed_arr = preprocessor.fit_transform(X)
    assert transformed_arr.shape[0] == len(X)
    assert transformed_arr.shape[1] > 0
