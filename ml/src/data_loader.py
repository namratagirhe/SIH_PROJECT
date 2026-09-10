import os
import pandas as pd
from typing import Tuple, List

# List of lab/sensor features that MUST be excluded from farmer model
EXCLUDED_LAB_FEATURES = [
    "somatic_cell_count",
    "milk_conductivity",
    "milk_ph",
    "milk_temperature",
    "milk_protein",
    "milk_lactose",
    "milk_fat",
    "bacterial_culture",
    "lab_test_results"
]

# Strict list of farmer-supported features
FARMER_FEATURES = [
    "species",
    "age",
    "breed",
    "previous_mastitis",
    "lactation",
    "milk_production",
    "abnormal_milk",
    "clots_flakes",
    "watery_milk",
    "color_change",
    "udder_swelling",
    "udder_heat",
    "udder_pain",
    "udder_redness",
    "udder_hardness"
]

TARGET_COLUMN = "mastitis"

def load_raw_dataset(csv_path: str = "ml/data/raw/bovine_mastitis_dataset.csv") -> pd.DataFrame:
    """
    Loads raw CSV dataset. If missing, invokes data generator.
    """
    if not os.path.exists(csv_path):
        from ml.src.download_real_data import generate_real_mastitis_dataset
        print(f"Dataset not found at {csv_path}. Generating dataset...")
        df = generate_real_mastitis_dataset(csv_path)
    else:
        df = pd.read_csv(csv_path)
    return df

def validate_and_extract_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Validates dataset schema, strips lab/sensor features, and returns X (farmer features) and y (target).
    """
    if TARGET_COLUMN not in df.columns:
        raise ValueError(f"Target column '{TARGET_COLUMN}' missing from dataset!")
        
    # Verify no lab/sensor features are included in farmer feature list
    for lab_col in EXCLUDED_LAB_FEATURES:
        if lab_col in FARMER_FEATURES:
            raise ValueError(f"CRITICAL ERROR: Lab feature '{lab_col}' found in farmer feature list!")
            
    # Extract available farmer features from dataset
    available_farmer_cols = [c for c in FARMER_FEATURES if c in df.columns]
    
    if len(available_farmer_cols) == 0:
        raise ValueError("No supported farmer features found in dataset!")
        
    print(f"Dataset loaded. Total columns: {len(df.columns)}")
    print(f"Lab features excluded: {[c for c in EXCLUDED_LAB_FEATURES if c in df.columns]}")
    print(f"Farmer features extracted ({len(available_farmer_cols)}): {available_farmer_cols}")
    
    X = df[available_farmer_cols].copy()
    y = df[TARGET_COLUMN].copy()
    
    return X, y

if __name__ == "__main__":
    df = load_raw_dataset()
    X, y = validate_and_extract_features(df)
    print(f"X shape: {X.shape}, y shape: {y.shape}")
