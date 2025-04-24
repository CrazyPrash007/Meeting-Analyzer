import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
try:
    load_dotenv()
    print("Successfully loaded .env file")
except Exception as e:
    print(f"Warning: Failed to load .env file: {e}")
    print("Continuing with default values")

class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "Meeting Analyzer"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Alibaba Cloud ASR settings
    ALIBABA_CLOUD_APP_KEY: str = os.getenv("ALIBABA_CLOUD_APP_KEY", "demo_app_key")
    ALIBABA_CLOUD_ACCESS_TOKEN: str = os.getenv("ALIBABA_CLOUD_ACCESS_TOKEN", "demo_access_token")
    
    # File storage settings
    DATA_DIR: str = os.path.join(os.getcwd(), "data")
    UPLOAD_DIR: str = os.path.join(os.getcwd(), "uploads")
    PDF_DIR: str = os.path.join(os.getcwd(), "pdfs")
    
    # Cohere AI settings (replaced DeepSeek)
    COHERE_API_KEY: str = os.getenv("COHERE_API_KEY", "demo_cohere_api_key")
    
    # CORS settings
    CORS_ORIGINS: list = ["http://localhost:3000", "https://localhost:3000"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        
        # Make validation more permissive - don't fail on missing values
        validate_assignment = True
        extra = "ignore"

# Create settings instance
settings = Settings()

# Ensure directories exist
os.makedirs(settings.DATA_DIR, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.PDF_DIR, exist_ok=True)

print(f"API Keys loaded - ALIBABA: {settings.ALIBABA_CLOUD_APP_KEY[:3]}..., COHERE: {settings.COHERE_API_KEY[:3]}...") 