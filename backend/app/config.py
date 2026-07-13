import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    database_url: str = ""
    jwt_secret: str = ""
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def async_database_url(self) -> str:
        env_url = os.environ.get("DATABASE_URL") or self.database_url
        if env_url:
            return env_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return f"sqlite+aiosqlite:///{os.path.join(os.path.dirname(os.path.dirname(__file__)), 'sales_dashboard.db')}"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
