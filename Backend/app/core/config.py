from pydantic_settings import BaseSettings, SettingsConfigDict

# Shared name of the httpOnly session cookie. Used by the auth router to set
# it on login/register (and clear it on logout) and by the auth dependencies
# as a fallback transport when no Authorization: Bearer header is present.
ACCESS_TOKEN_COOKIE_NAME = "mindcode_token"


class Settings(BaseSettings):
    project_name: str = "MindCode Academy"
    version: str = "0.1.0"
    database_url: str = "postgresql://user:password@localhost:5432/platziflix"

    # Comma-separated list of allowed CORS origins (e.g. "https://app.vercel.app,http://localhost:3000")
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # JWT Configuration - shorter expiration for production security
    secret_key: str = "your-secret-key-change-this-in-production-must-be-at-least-32-chars"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15  # Short-lived access tokens

    # Rate limiting
    rate_limit_auth: str = "5/minute"
    rate_limit_general: str = "100/hour"

    # extra="ignore": legacy .env files contain variables that are no longer
    # part of Settings (e.g. POSTGRES_USER, RATE_LIMIT_*); without this,
    # bare-metal runs outside Docker crash with extra_forbidden errors.
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
