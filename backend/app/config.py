"""Application configuration — loaded from environment variables."""

from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore", populate_by_name=True)

    app_name: str = "4CHGM API"
    app_version: str = "0.2.0"
    environment: str = "development"
    debug: bool = False

    cors_origins: str = "http://localhost:3000"

    database_url: str = Field(default="", validation_alias="DATABASE_URL")
    redis_url: str = "redis://localhost:6379/0"

    jwt_secret: str = "change-me-in-production-use-64-char-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 30

    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536

    # Cloudflare R2 (S3-compatible)
    r2_account_id: str = Field(default="", validation_alias="CLOUDFLARE_R2_ACCOUNT_ID")
    r2_access_key_id: str = Field(default="", validation_alias="CLOUDFLARE_R2_ACCESS_KEY")
    r2_secret_access_key: str = Field(default="", validation_alias="CLOUDFLARE_R2_SECRET_KEY")
    r2_bucket_uploads: str = "4chgm-uploads"
    r2_bucket_generated: str = "4chgm-generated"
    r2_bucket_diagrams: str = "4chgm-diagrams"
    r2_bucket_exports: str = "4chgm-exports"
    r2_public_base_url: str = ""

    celery_broker_url: str = ""
    celery_result_backend: str = ""

    sentry_dsn: str = ""

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def r2_enabled(self) -> bool:
        return bool(self.r2_account_id and self.r2_access_key_id and self.r2_secret_access_key)

    @property
    def openai_enabled(self) -> bool:
        return bool(self.openai_api_key)

    @property
    def celery_broker(self) -> str:
        return self.celery_broker_url or self.redis_url


@lru_cache
def get_settings() -> Settings:
    return Settings()
