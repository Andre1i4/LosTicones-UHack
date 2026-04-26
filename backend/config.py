import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Set GCP credentials before anything else imports google.cloud
_creds_path = Path(__file__).parent / "gcp-service-account.json"
if _creds_path.exists() and not os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(_creds_path)

class Settings(BaseSettings):
    """Backend configuration from environment or defaults"""
    
    # FastAPI
    DEBUG: bool = True
    API_TITLE: str = "U-Scout API"
    API_VERSION: str = "0.1.0"
    
    # GCP BigQuery
    GCP_PROJECT: str = "los-ticones-u-hack"
    BIGQUERY_DATASET: str = "u_scout"
    BIGQUERY_TABLE: str = "v_master_stats"
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"
    
    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

settings = Settings()
