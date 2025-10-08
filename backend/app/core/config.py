"""
Application Configuration

Uses pydantic-settings to load configuration from environment variables.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    APP_ENV: str = "development"
    APP_NAME: str = "webpv-backend"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # SQL Server (Legacy Data - Read Only)
    MSSQL_SERVER: str = "localhost"
    MSSQL_PORT: int = 1433
    MSSQL_USER: str = "sa"
    MSSQL_PASSWORD: str = ""
    MSSQL_DATABASE: str = "mbaFerguez"

    # Firestore (App Database)
    FIRESTORE_EMULATOR_HOST: Optional[str] = None  # Set to "localhost:8910" for local dev
    FIRESTORE_PROJECT_ID: str = "webpv-dev"
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None  # Path to service account JSON for production

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Frontend
    FRONTEND_BUILD_PATH: str = "../frontend/dist"

    # Rate limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_MINUTE: int = 5
    RATE_LIMIT_LOCKOUT_MINUTES: int = 15

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()
