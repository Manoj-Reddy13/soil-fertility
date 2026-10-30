import numpy as np
import pandas as pd
from typing import Dict, Any, Union

REQUIRED_FEATURES = ["N", "P", "K", "ph", "ec", "oc", "S", "zn", "fe", "cu", "Mn", "B"]

def prepare_input_dataframe(data: Union[Dict[str, Any], pd.DataFrame]) -> pd.DataFrame:
    """
    Validates feature presence, enforces exact feature column ordering,
    and applies the exact Log10 scaling used in the training pipeline.
    """
    if isinstance(data, dict):
        missing = [f for f in REQUIRED_FEATURES if f not in data]
        if missing:
            raise ValueError(f"Missing required soil features: {missing}")
        row = {f: float(data[f]) for f in REQUIRED_FEATURES}
        df = pd.DataFrame([row])
    elif isinstance(data, pd.DataFrame):
        missing = [f for f in REQUIRED_FEATURES if f not in data.columns]
        if missing:
            raise ValueError(f"Missing required columns in DataFrame: {missing}")
        df = data[REQUIRED_FEATURES].astype(float).copy()
    else:
        raise TypeError(f"Expected dict or DataFrame, got {type(data)}")

    # Log10 transformation as established in Soil_Fertility.ipynb
    # Clamps values <= 0 to a small positive epsilon (1e-6) to avoid -inf/NaN
    df_transformed = df.apply(
        lambda col: np.log10(np.where(col <= 0, 1e-6, col)) if np.issubdtype(col.dtype, np.number) else col
    )
    return df_transformed

