from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    app_name: str = "CYBERGUARD"
    environment: str = "development"
    debug: bool = True
    port: int = 8000
    host: str = "127.0.0.1"

    # Cryptographic secret for signing sessions
    secret_key: str = Field(
        default="cyberguard-ultra-secure-key-32-chars-long-soc-platform-2026",
        validation_alias="SECRET_KEY",
    )
    session_expire_hours: int = 24
    cookie_name: str = "cg_session"
    cookie_secure: bool = False
    cookie_samesite: str = "lax"

    cors_origins: List[str] = [
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:80",
        "http://127.0.0.1:80",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    # Server-Side Controlled Demo Credentials (Never exposed to client)
    demo_admin_email: str = Field(
        default="analyst@cyberguard.internal",
        validation_alias="DEMO_ADMIN_EMAIL",
    )
    demo_admin_password: str = Field(
        default="CyberGuard2026!SecOps",
        validation_alias="DEMO_ADMIN_PASSWORD",
    )
    demo_admin_name: str = "Chief Security Analyst"
    demo_admin_org: str = "Cyber Defense Center"

    # SQLite for development, PostgreSQL in production
    database_url: str = Field(
        default="sqlite:///./data/cyberguard.db",
        validation_alias="DATABASE_URL",
    )

    # DeepSeek AI Integration (Primary Fast LLM)
    deepseek_api_key: str = Field(default="", validation_alias="DEEPSEEK_API_KEY")
    deepseek_model: str = Field(default="deepseek-flash", validation_alias="DEEPSEEK_MODEL")
    deepseek_base_url: str = Field(default="https://api.deepseek.com", validation_alias="DEEPSEEK_BASE_URL")

    # Groq AI Integration (Alternative cloud fallback)
    groq_api_key: str = Field(default="", validation_alias="GROQ_API_KEY")
    groq_model: str = Field(default="llama-3.3-70b-versatile", validation_alias="GROQ_MODEL")

    # Scoring Weights
    heuristic_weight: float = 0.70
    ml_weight: float = 0.30

settings = Settings()
