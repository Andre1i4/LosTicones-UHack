from pydantic_settings import BaseSettings

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
