from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = ""

    # Security
    secret_key: str = ""
    jwt_secret_key: str = ""
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    jwt_access_token_expires: int = 86400

    # Admin
    admin_email: str = ""
    admin_secret_key_hash: str = ""

    # Groq
    groq_api_key: str = ""

    # AI
    ai_model: str = "llama-3.1-8b-instant"
    ai_max_tokens: int = 1024

    # App
    app_name: str = "FAQ Bot SaaS"
    debug: bool = False
    frontend_url: str = "http://localhost:5173"

    # Plan limits
    plan_limits: dict = {
        "free":       {"domains": 1,      "questions_per_month": 500,    "max_md_size_kb": 500},
        "pro":        {"domains": 10,     "questions_per_month": 10000,  "max_md_size_kb": 5120},
        "enterprise": {"domains": 999999, "questions_per_month": 999999, "max_md_size_kb": 20480},
    }

    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    return Settings()