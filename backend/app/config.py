import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env file from project root directory
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
root_dir = os.path.abspath(os.path.join(backend_dir, ".."))
load_dotenv(os.path.join(root_dir, ".env"))

class Settings(BaseSettings):
    PROJECT_NAME: str = "QualiVision AI API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    BASE_DIR: str = backend_dir
    
    DATA_ROOT: str = ""
    DATABASE_URL: str = ""
    UPLOAD_DIR: str = ""
    HEATMAP_DIR: str = ""
    SAMPLES_DIR: str = ""
    
    MAX_UPLOAD_SIZE_MB: int = 15
    CORS_ORIGINS: str = "*"
    SECRET_KEY: str = "qualivision-ai-secret-key-change-in-production"

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

    def model_post_init(self, __context):
        is_vercel = bool(os.environ.get("VERCEL"))
        if not self.DATA_ROOT:
            self.DATA_ROOT = "/tmp" if is_vercel else os.path.join(self.BASE_DIR, "data")
        if not self.DATABASE_URL:
            self.DATABASE_URL = f"sqlite:///{os.path.join(self.DATA_ROOT, 'qualivision.db')}"
        if not self.UPLOAD_DIR:
            self.UPLOAD_DIR = os.path.join(self.DATA_ROOT, "uploads")
        if not self.HEATMAP_DIR:
            self.HEATMAP_DIR = os.path.join(self.DATA_ROOT, "heatmaps")
        if not self.SAMPLES_DIR:
            self.SAMPLES_DIR = os.path.join(self.DATA_ROOT, "samples") if is_vercel else os.path.join(self.BASE_DIR, "data", "samples")

settings = Settings()

try:
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    if db_path:
        os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.HEATMAP_DIR, exist_ok=True)
    os.makedirs(settings.SAMPLES_DIR, exist_ok=True)
except Exception:
    pass

