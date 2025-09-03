from pydantic_settings import BaseSettings, SettingsConfigDict

_base_config = SettingsConfigDict(
    env_file="./.env", env_ignore_empty=True, extra="ignore"
)


class DatabaseSettings(BaseSettings):
    model_config = _base_config
    DB_URL: str
    BLACKLIST_DB: str


class SecuritySettings(BaseSettings):
    model_config = _base_config
    JWT_SECRET: str
    JWT_ALGORITHM: str


database_settings = DatabaseSettings()
security_settings = SecuritySettings()
