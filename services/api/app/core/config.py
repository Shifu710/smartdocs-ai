from functools import lru_cache
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def normalize_asyncpg_query(value: str) -> str:
    """Keep Neon/Postgres URLs compatible with asyncpg."""
    split_url = urlsplit(value)
    query = dict(parse_qsl(split_url.query, keep_blank_values=True))
    query.pop("channel_binding", None)
    if query.get("sslmode") == "require":
        query["ssl"] = "require"
        query.pop("sslmode", None)
    return urlunsplit((split_url.scheme, split_url.netloc, split_url.path, urlencode(query), split_url.fragment))


class Settings(BaseSettings):
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    secret_key: str = Field(default="change-me-in-production", min_length=16)
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    database_url: str = "postgresql+asyncpg://smartdocs:smartdocs@postgres:5432/smartdocs"
    redis_url: str = "redis://redis:6379/0"

    upload_dir: str = "/uploads"
    max_file_size_mb: int = 20

    next_public_app_url: str = "http://localhost:3000"
    cors_origins_raw: str = "http://localhost:3000,http://127.0.0.1:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("database_url")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        if value.startswith("postgres://"):
            value = "postgresql://" + value.removeprefix("postgres://")
        if value.startswith("postgresql://"):
            value = "postgresql+asyncpg://" + value.removeprefix("postgresql://")
        return normalize_asyncpg_query(value)

    @field_validator("cors_origins_raw")
    @classmethod
    def strip_cors_value(cls, value: str) -> str:
        return value.strip()

    @property
    def cors_origins(self) -> list[str]:
        origins = [origin.strip() for origin in self.cors_origins_raw.split(",")]
        return [origin for origin in origins if origin]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
