import uvicorn
from fastapi import FastAPI
from app.api.meetings import router
import os
from app.core.config import settings

app = FastAPI()

# Include routers
app.include_router(router, prefix="/api")

# Ensure data directory exists
os.makedirs(settings.DATA_DIR, exist_ok=True)

if __name__ == "__main__":
    print("Starting server on http://localhost:8000")
    print("API documentation available at http://localhost:8000/docs")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 