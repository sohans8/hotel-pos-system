import os
from typing import Optional

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseModel as BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ApexPOS Commercial Restaurant Suite"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-pos-production-key-99451-change-me")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # SQLite local DB by default (supports local-first resilience), easily configured for PostgreSQL via DATABASE_URL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./apexpos.db"
    )
    
    SUPERADMIN_EMAIL: str = os.getenv("SUPERADMIN_EMAIL", "superadmin@apexpos.com")
    SUPERADMIN_PASSWORD: str = os.getenv("SUPERADMIN_PASSWORD", "SuperAdmin@Apex2026!")

settings = Settings()
