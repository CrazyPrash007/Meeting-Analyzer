from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import shutil
from ..db.database import get_db, Meeting, PDF
from ..services.alibaba_asr import alibaba_asr_service
from ..services.cohere_analysis import cohere_analysis_service
from ..services.pdf_generator import pdf_generator_service
from ..core.config import settings
from typing import List, Optional
from pydantic import BaseModel
import uuid

# Create router
router = APIRouter(prefix="/meetings", tags=["meetings"])


# Define Pydantic models
class MeetingBase(BaseModel):
    title: str
    language: str = "en"


class MeetingCreate(MeetingBase):
    pass


class MeetingResponse(MeetingBase):
    id: int
    transcription: Optional[str] = None
    translation: Optional[str] = None
    summary: Optional[str] = None
    action_items: Optional[str] = None
    
    class Config:
        from_attributes = True


class PDFResponse(BaseModel):
    id: int
    meeting_id: int
    file_path: str
    pdf_type: str
    
    class Config:
        from_attributes = True


@router.post("/upload", response_model=MeetingResponse)
async def upload_meeting_audio(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    language: str = Form("en"),
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload meeting audio file for processing
    """
    # Generate unique filename
    file_extension = os.path.splitext(audio_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Save uploaded file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")
    
    # Create meeting record
    db_meeting = Meeting(
        title=title,
        language=language,
        audio_path=file_path
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    
    # Process audio in background
    background_tasks.add_task(
        process_meeting_audio,
        meeting_id=db_meeting.id,
        audio_path=file_path,
        language=language,
        db=db
    )
    
    return db_meeting


@router.get("/", response_model=List[MeetingResponse])
def get_meetings(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get list of all meetings
    """
    meetings = db.query(Meeting).offset(skip).limit(limit).all()
    return meetings


@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(
    meeting_id: int,
    db: Session = Depends(get_db)
):
    """
    Get meeting by ID
    """
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@router.get("/{meeting_id}/pdf/{pdf_type}")
def get_meeting_pdf(
    meeting_id: int,
    pdf_type: str,
    db: Session = Depends(get_db)
):
    """
    Get meeting PDF by type (transcript, summary, report)
    """
    # Check if meeting exists
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Check if PDF exists
    pdf = db.query(PDF).filter(
        PDF.meeting_id == meeting_id,
        PDF.pdf_type == pdf_type
    ).first()
    
    # If PDF doesn't exist, generate it
    if not pdf:
        if pdf_type == "transcript":
            if not meeting.transcription:
                raise HTTPException(status_code=400, detail="Meeting has no transcription")
            file_path = pdf_generator_service.generate_transcript_pdf(
                meeting.title, meeting.transcription, meeting.id
            )
        elif pdf_type == "summary":
            if not meeting.summary or not meeting.action_items:
                raise HTTPException(status_code=400, detail="Meeting has no summary or action items")
            file_path = pdf_generator_service.generate_summary_pdf(
                meeting.title, meeting.summary, meeting.action_items, meeting.id
            )
        elif pdf_type == "report":
            if not meeting.transcription or not meeting.summary:
                raise HTTPException(status_code=400, detail="Meeting incomplete")
            file_path = pdf_generator_service.generate_full_report_pdf(
                meeting.title, meeting.transcription, meeting.summary, 
                meeting.action_items or "No action items", meeting.id
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid PDF type")
        
        # Save PDF record
        pdf = PDF(
            meeting_id=meeting_id,
            file_path=file_path,
            pdf_type=pdf_type
        )
        db.add(pdf)
        db.commit()
        db.refresh(pdf)
    
    # Return file
    return FileResponse(
        pdf.file_path,
        filename=os.path.basename(pdf.file_path),
        media_type="application/pdf"
    )


@router.post("/{meeting_id}/translate")
def translate_meeting(
    meeting_id: int,
    target_language: str,
    db: Session = Depends(get_db)
):
    """
    Translate meeting transcription to target language
    """
    # Check if meeting exists
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Check if transcription exists
    if not meeting.transcription:
        raise HTTPException(status_code=400, detail="Meeting has no transcription")
    
    # Translate text
    source_language = meeting.language
    try:
        # Ensure proper language codes are used
        source_lang = source_language
        target_lang = target_language
        
        # Map special language cases
        if source_language == "yue":
            source_lang = "zh_hk"  # Use Hong Kong Chinese for Cantonese
        elif source_language == "zh":
            source_lang = "zh_cn"  # Use Mainland Chinese for Mandarin
            
        if target_language == "yue":
            target_lang = "zh_hk"  # Use Hong Kong Chinese for Cantonese
        elif target_language == "zh":
            target_lang = "zh_cn"  # Use Mainland Chinese for Mandarin
            
        translation = alibaba_asr_service.translate_text(
            meeting.transcription,
            source_lang=source_lang,
            target_lang=target_lang
        )
        
        # Update meeting record
        meeting.translation = translation
        db.commit()
        db.refresh(meeting)
        
        return {"status": "success", "meeting_id": meeting_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {e}")


async def process_meeting_audio(meeting_id: int, audio_path: str, language: str, db: Session):
    """
    Background task to process meeting audio
    """
    try:
        # Transcribe audio
        transcription = alibaba_asr_service.transcribe_audio(audio_path, language)
        
        # Analyze transcription with Cohere
        analysis = cohere_analysis_service.analyze_transcript(transcription)
        
        # Update meeting record
        meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
        if meeting:
            meeting.transcription = transcription
            meeting.summary = analysis["summary"]
            meeting.action_items = analysis["action_items"]
            db.commit()
    except Exception as e:
        print(f"Error processing meeting audio: {e}")
        # Handle error 


@router.delete("/{meeting_id}")
def delete_meeting(
    meeting_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a meeting and associated files
    """
    # Check if meeting exists
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    try:
        print(f"Deleting meeting ID {meeting_id}: {meeting.title}")
        deleted_files = []
        
        # Delete associated PDFs
        pdf_files = db.query(PDF).filter(PDF.meeting_id == meeting_id).all()
        for pdf in pdf_files:
            # Delete PDF file if it exists
            if pdf.file_path and os.path.exists(pdf.file_path):
                try:
                    os.remove(pdf.file_path)
                    deleted_files.append(pdf.file_path)
                except Exception as e:
                    print(f"Warning: Failed to delete PDF file {pdf.file_path}: {e}")
            db.delete(pdf)
        
        # Delete audio file if it exists
        if meeting.audio_path and os.path.exists(meeting.audio_path):
            try:
                os.remove(meeting.audio_path)
                deleted_files.append(meeting.audio_path)
            except Exception as e:
                print(f"Warning: Failed to delete audio file {meeting.audio_path}: {e}")
        
        # Delete meeting from database
        db.delete(meeting)
        db.commit()
        
        print(f"Successfully deleted meeting and {len(deleted_files)} associated files")
        return {
            "status": "success", 
            "message": "Meeting deleted successfully",
            "deleted_files_count": len(deleted_files)
        }
    except Exception as e:
        db.rollback()
        print(f"Error deleting meeting {meeting_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete meeting: {e}") 