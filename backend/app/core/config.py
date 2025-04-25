import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
try:
    load_dotenv()
    print("Successfully loaded .env file")
except Exception as e:
    print(f"Warning: Failed to load .env file: {e}")
    print("Continuing with environment variables")

class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "Meeting Analyzer"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # AssemblyAI settings (replacing Alibaba Cloud)
    ASSEMBLY_AI_API_KEY: str = os.getenv("ASSEMBLY_AI_API_KEY", "")
    
    # File storage settings
    DATA_DIR: str = os.path.join(os.getcwd(), "data")
    UPLOAD_DIR: str = os.path.join(os.getcwd(), "uploads")
    PDF_DIR: str = os.path.join(os.getcwd(), "pdfs")
    
    # Cohere AI settings
    COHERE_API_KEY: str = os.getenv("COHERE_API_KEY", "")
    
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

# Check for missing API keys
missing_keys = []
if not settings.ASSEMBLY_AI_API_KEY or settings.ASSEMBLY_AI_API_KEY == "":
    missing_keys.append("ASSEMBLY_AI_API_KEY")
if not settings.COHERE_API_KEY or settings.COHERE_API_KEY == "":
    missing_keys.append("COHERE_API_KEY")

if missing_keys:
    print("⚠️ WARNING: The following API keys are missing:")
    for key in missing_keys:
        print(f"  - {key}")
    print("Some functionality may be limited or unavailable.")
    print("Please set these environment variables or add them to your .env file.")
else:
    print("✅ All required API keys are set.")
    
    # Log masked API keys for confirmation
    def mask_string(s):
        if not s or len(s) < 8:
            return "***"
        return s[:3] + "..." + s[-3:]
        
    print(f"API Keys loaded:")
    print(f"  - ASSEMBLY_AI_API_KEY: {mask_string(settings.ASSEMBLY_AI_API_KEY)}")
    print(f"  - COHERE_API_KEY: {mask_string(settings.COHERE_API_KEY)}") 