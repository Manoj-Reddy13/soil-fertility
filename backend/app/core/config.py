import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "Data"
MODEL_PATH = BASE_DIR / "random_forest_pkl.pkl"
DATASET_PATH = DATA_DIR / "Soil Fertility Data (Modified Data).csv"

class Settings(BaseModel):
    PROJECT_NAME: str = "SoilSense AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'soilsense.db'}")
    MODEL_FILE: str = str(MODEL_PATH)
    DATASET_FILE: str = str(DATASET_PATH)
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()

