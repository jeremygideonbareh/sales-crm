import os
from pydantic_settings import BaseSettings, SettingsConfigDict


DB_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_DB_URL = f"sqlite+aiosqlite:///{os.path.join(DB_DIR, 'sales_dashboard.db')}"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = DEFAULT_DB_URL
    jwt_secret: str = "change-this-to-a-long-random-secret-key"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,https://sales-crm-cmg.pages.dev"
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""

    @property
    def async_database_url(self) -> str:
        env_url = os.environ.get("DATABASE_URL")
        if env_url:
            return env_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return self.database_url

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
