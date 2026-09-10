from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
import pandas as pd
from typing import List, Tuple

NUMERICAL_FEATURES = ["age", "lactation"]

CATEGORICAL_FEATURES = [
    "species",
    "breed",
    "previous_mastitis",
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

def build_preprocessing_pipeline(
    df: pd.DataFrame
) -> Tuple[ColumnTransformer, List[str], List[str]]:
    """
    Creates a Scikit-Learn ColumnTransformer for numerical and categorical preprocessing.
    """
    existing_num = [c for c in NUMERICAL_FEATURES if c in df.columns]
    existing_cat = [c for c in CATEGORICAL_FEATURES if c in df.columns]

    num_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    cat_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_transformer, existing_num),
            ("cat", cat_transformer, existing_cat)
        ],
        remainder="drop"
    )

    return preprocessor, existing_num, existing_cat
