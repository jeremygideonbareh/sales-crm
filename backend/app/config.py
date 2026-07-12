import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    database_url: str = f"sqlite+aiosqlite:///{os.path.join(os.path.dirname(os.path.dirname(__file__)), 'sales_dashboard.db')}"
    jwt_secret: str = "change-this-to-a-long-random-secret-key"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24

    @property
    def async_database_url(self) -> str:
        env_url = os.environ.get("DATABASE_URL")
        if env_url:
            return env_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return self.database_url


settings = Settings()
