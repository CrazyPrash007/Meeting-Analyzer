import os
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from api.routes import transcription_router
from database.database import init_db

app = FastAPI(title="Multilingual Meeting Note Taker")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(transcription_router.router)

# Initialize database on startup
@app.on_event("startup")
async def startup():
    await init_db()

# Mount uploads directory
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 