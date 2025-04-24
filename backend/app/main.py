from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import meetings
from .core.config import settings
import uvicorn
import os

# Ensure upload and PDF directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.PDF_DIR, exist_ok=True)

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(meetings.router, prefix=settings.API_PREFIX)

# Root endpoint
@app.get("/")
def read_root():
    return {
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "message": "Welcome to the Meeting Analysis API"
    }

# For running the application directly
if __name__ == "__main__":
    print("Starting server on http://localhost:8000")
    print("API documentation available at http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 