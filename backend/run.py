import uvicorn
import os
from app.core.config import settings

if __name__ == "__main__":
    # Ensure directories exist - these are also checked in config.py
    # but we double-check here to be safe
    os.makedirs(settings.DATA_DIR, exist_ok=True)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.PDF_DIR, exist_ok=True)
    
    # Run FastAPI application
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 