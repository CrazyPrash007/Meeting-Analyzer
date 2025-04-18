from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, Text, DateTime
from pydantic import BaseModel

from ..database.database import Base

# SQLAlchemy model for the database
class Transcription(Base):
    """Database model for transcriptions"""
    __tablename__ = "transcriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_file_path = Column(String, nullable=False)
    language = Column(String, nullable=False)
    transcript_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Pydantic models for API
class TranscriptionBase(BaseModel):
    """Base model for transcription data"""
    filename: str
    language: str
    transcript_text: str

class TranscriptionCreate(TranscriptionBase):
    """Model for creating a new transcription"""
    original_file_path: str

class TranscriptionResponse(TranscriptionBase):
    """Model for transcription response"""
    id: int
    created_at: datetime
    original_file_path: Optional[str] = None
    
    class Config:
        orm_mode = True 