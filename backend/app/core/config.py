import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "UPI SHIELD"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "upishield-super-secret-production-key-2026-secure-hackathon")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database (Default: SQLite for friction-free local execution, PostgreSQL supported)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./upi_shield.db"
    )
    
    # MongoDB Database
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://127.0.0.1:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "upi_shield")
    MONGODB_ENABLED: bool = os.getenv("MONGODB_ENABLED", "true").lower() in ("true", "1", "yes")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Risk Engine Weights
    WEIGHT_MESSAGE: float = 0.20
    WEIGHT_URL: float = 0.15
    WEIGHT_UPI: float = 0.15
    WEIGHT_TRANSACTION_ANOMALY: float = 0.20
    WEIGHT_BEHAVIOUR: float = 0.15
    WEIGHT_GRAPH: float = 0.15
    
    class Config:
        case_sensitive = True

settings = Settings()
