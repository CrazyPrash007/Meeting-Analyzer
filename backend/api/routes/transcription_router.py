import os
import uuid
import tempfile
from typing import Optional
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ...utils.transcription_service import TranscriptionService
from ...database.database import get_db
from ...models.transcription import TranscriptionCreate, TranscriptionResponse, Transcription

router = APIRouter(prefix="/api/transcriptions", tags=["transcriptions"])

# Create upload directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

# Configure which ASR provider to use (whisper or alibaba)
ASR_PROVIDER = os.getenv("ASR_PROVIDER", "whisper")


@router.post("/", response_model=TranscriptionResponse)
async def create_transcription(
    background_tasks: BackgroundTasks,
    audio_file: UploadFile = File(...),
    language: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """Upload and transcribe an audio file"""
    
    # Save the uploaded file
    file_path = f"uploads/{uuid.uuid4()}_{audio_file.filename}"
    with open(file_path, "wb") as buffer:
        buffer.write(await audio_file.read())
    
    # Initialize the transcription service with the configured provider
    transcription_service = TranscriptionService(provider=ASR_PROVIDER)
    
    # Process transcription in the background
    background_tasks.add_task(
        process_transcription,
        file_path=file_path,
        filename=audio_file.filename,
        language=language,
        db=db,
        transcription_service=transcription_service
    )
    
    # Return immediately with a pending status
    return JSONResponse(
        content={
            "id": file_path,  # Temporary ID until processing is complete
            "filename": audio_file.filename,
            "status": "processing",
            "message": "Transcription is being processed. Check back later."
        },
        status_code=202
    )


@router.get("/{transcription_id}", response_model=TranscriptionResponse)
async def get_transcription(transcription_id: int, db: AsyncSession = Depends(get_db)):
    """Get a transcription by ID"""
    
    # Fetch the transcription from the database
    query = select(Transcription).where(Transcription.id == transcription_id)
    result = await db.execute(query)
    transcription = result.scalar_one_or_none()
    
    if not transcription:
        raise HTTPException(status_code=404, detail="Transcription not found")
    
    return transcription


async def process_transcription(
    file_path: str,
    filename: str,
    language: Optional[str],
    db: AsyncSession,
    transcription_service: TranscriptionService
):
    """Process the transcription in the background"""
    
    try:
        # Transcribe the audio file
        result = transcription_service.transcribe(file_path, language)
        
        if result["status"] == "error":
            # Handle transcription error
            # In a production system, you might want to log this or retry
            print(f"Transcription error: {result['message']}")
            return
        
        # Create transcription record in database
        transcription = TranscriptionCreate(
            filename=filename,
            original_file_path=file_path,
            language=result.get("language", language or "unknown"),
            transcript_text=result["transcript_text"]
        )
        
        db_transcription = Transcription(**transcription.dict())
        db.add(db_transcription)
        await db.commit()
        await db.refresh(db_transcription)
        
    except Exception as e:
        # Log the error
        print(f"Error processing transcription: {str(e)}")
        # In a production system, you would want better error handling and logging 