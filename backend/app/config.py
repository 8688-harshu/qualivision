import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "QualiVision AI API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    DATABASE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'data', 'qualivision.db')}"
    
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "data", "uploads")
    HEATMAP_DIR: str = os.path.join(BASE_DIR, "data", "heatmaps")
    SAMPLES_DIR: str = os.path.join(BASE_DIR, "data", "samples")
    
    MAX_UPLOAD_SIZE_MB: int = 15

    class Config:
        case_sensitive = True

settings = Settings()

os.makedirs(os.path.dirname(settings.DATABASE_URL.replace("sqlite:///", "")), exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.HEATMAP_DIR, exist_ok=True)
os.makedirs(settings.SAMPLES_DIR, exist_ok=True)
