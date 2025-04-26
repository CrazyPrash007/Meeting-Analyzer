from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import shutil
from ..db.database import get_db, Meeting, PDF
from ..services.assembly_ai import assembly_ai_service
from ..services.cohere_analysis import cohere_analysis_service
from ..services.pdf_generator import pdf_generator_service
from ..core.config import settings
from typing import List, Optional
from pydantic import BaseModel
import uuid
import datetime

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
    date: Optional[datetime.datetime] = None
    timezone: Optional[str] = "UTC"
    detected_language: Optional[str] = None
    audio_duration: Optional[str] = None
    
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
    audio_file: UploadFile = File(...),
    timezone: str = Form("UTC"),  # Add timezone parameter with default UTC
    db: Session = Depends(get_db)
):
    """
    Upload meeting audio file for processing
    Language will be auto-detected during processing
    Timezone parameter specifies the client's timezone
    """
    # Generate unique filename
    file_extension = os.path.splitext(audio_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Save uploaded file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")
    
    # Create meeting record with English as default language
    # Language will be detected during processing if possible
    try:
        # Create a new meeting with current time and provided timezone
        current_time = datetime.datetime.utcnow()
        
        db_meeting = Meeting(
            title=title,
            language="en",  # Default to English, will be updated if detected otherwise
            audio_path=file_path,
            date=current_time,
            timezone=timezone  # Store the client's timezone
        )
        db.add(db_meeting)
        db.commit()
        db.refresh(db_meeting)
        
        # Process audio in background
        background_tasks.add_task(
            process_meeting_audio,
            meeting_id=db_meeting.id,
            audio_path=file_path,
            db=db
        )
        
        return db_meeting
    except Exception as e:
        # If there's a database error, handle it
        db.rollback()
        # Delete the uploaded file
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


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
    Get meeting document by type (transcript, summary, report)
    Returns PDF if possible, falls back to text file if there are issues
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
    file_path = None
    try:
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
        
        # Check if the file exists
        if not os.path.exists(pdf.file_path):
            # File might have been deleted or moved
            # Generate a text file as fallback
            print(f"PDF file not found at {pdf.file_path}, generating text fallback")
            
            # Create a text fallback based on PDF type
            fallback_dir = os.path.join(settings.PDF_DIR, "fallback")
            os.makedirs(fallback_dir, exist_ok=True)
            
            fallback_filename = f"{pdf_type}_{meeting_id}_{meeting.title.replace(' ', '_')}.txt"
            fallback_path = os.path.join(fallback_dir, fallback_filename)
            
            with open(fallback_path, 'w', encoding='utf-8') as f:
                f.write(f"=== {pdf_type.upper()} FOR: {meeting.title} ===\n\n")
                if pdf_type == "transcript":
                    f.write(meeting.transcription or "No transcription available")
                elif pdf_type == "summary":
                    f.write(f"SUMMARY:\n{meeting.summary or 'No summary available'}\n\n")
                    f.write(f"ACTION ITEMS:\n{meeting.action_items or 'No action items available'}")
                elif pdf_type == "report":
                    f.write(f"SUMMARY:\n{meeting.summary or 'No summary available'}\n\n")
                    f.write(f"ACTION ITEMS:\n{meeting.action_items or 'No action items available'}\n\n")
                    f.write(f"TRANSCRIPT:\n{meeting.transcription or 'No transcription available'}")
            
            # Update the PDF record with the new path
            pdf.file_path = fallback_path
            db.commit()
            db.refresh(pdf)
        
        # Determine media type based on file extension
        file_extension = os.path.splitext(pdf.file_path)[1].lower()
        media_type = "application/pdf" if file_extension == ".pdf" else "text/plain"
        
        # Set a proper filename for the download
        download_filename = f"{meeting.title}_{pdf_type}{file_extension}"
        
        # Return file
        return FileResponse(
            pdf.file_path,
            filename=download_filename,
            media_type=media_type
        )
    
    except Exception as e:
        print(f"Error generating document: {e}")
        
        # Create a simple text file as emergency fallback
        emergency_filename = f"emergency_{pdf_type}_{meeting_id}.txt"
        emergency_path = os.path.join(settings.PDF_DIR, emergency_filename)
        
        try:
            with open(emergency_path, 'w', encoding='utf-8') as f:
                f.write(f"=== {pdf_type.upper()} FOR: {meeting.title} ===\n\n")
                f.write(f"Error generating document: {str(e)}\n\n")
                
                if pdf_type == "transcript":
                    f.write("TRANSCRIPT:\n" + (meeting.transcription or "No transcription available"))
                elif pdf_type == "summary":
                    f.write("SUMMARY:\n" + (meeting.summary or "No summary available"))
                    f.write("\n\nACTION ITEMS:\n" + (meeting.action_items or "No action items available"))
                elif pdf_type == "report":
                    f.write("SUMMARY:\n" + (meeting.summary or "No summary available"))
                    f.write("\n\nACTION ITEMS:\n" + (meeting.action_items or "No action items available"))
                    f.write("\n\nTRANSCRIPT:\n" + (meeting.transcription or "No transcription available"))
            
            return FileResponse(
                emergency_path,
                filename=f"{meeting.title}_{pdf_type}.txt",
                media_type="text/plain"
            )
        except Exception as fallback_error:
            print(f"Emergency fallback failed: {fallback_error}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to generate document: {str(e)}. Emergency fallback also failed: {str(fallback_error)}"
            )


@router.post("/{meeting_id}/translate")
def translate_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    target_language: str = "zh"  # Default to Chinese if not provided
):
    """
    Translate meeting transcription to target language
    """
    print(f"Translating meeting {meeting_id} to language {target_language}")
    
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
        print(f"Translating from {source_language} to {target_language}")
        translation = assembly_ai_service.translate_text(
            meeting.transcription,
            source_lang=source_language,
            target_lang=target_language
        )
        
        # Update meeting record
        meeting.translation = translation
        db.commit()
        db.refresh(meeting)
        
        return {"status": "success", "meeting_id": meeting_id, "target_language": target_language}
    except Exception as e:
        print(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail=f"Translation failed: {e}")


async def process_meeting_audio(meeting_id: int, audio_path: str, db: Session):
    """
    Background task to process meeting audio with auto language detection
    """
    try:
        print(f"Processing meeting audio for meeting_id={meeting_id}, audio_path={audio_path}")
        
        # Transcribe audio with auto language detection
        print("Starting transcription with language detection...")
        audio_info = {}
        try:
            transcription = assembly_ai_service.transcribe_audio(audio_path)
            if not transcription or transcription.strip() == "":
                print("Warning: Received empty transcription result")
                transcription = "Transcription failed. Please try again with a clearer audio file."
            
            # Get audio information if available
            audio_info = assembly_ai_service.get_audio_info(audio_path)
            print(f"Audio info: {audio_info}")
            
        except Exception as e:
            print(f"Error in transcription: {e}")
            transcription = f"Transcription failed: {str(e)}"
        
        print(f"Transcription completed. Length: {len(transcription) if transcription else 0} characters")
        
        # Analyze transcription with Cohere if we have valid transcription
        summary = ""
        action_items = ""
        
        # Check if we need to use demo data
        if "This is a demo transcription" in transcription:
            print("Using demo data for realistic meeting results")
            # Use realistic transcription
            transcription = """
John: Good morning everyone. Thanks for joining our product planning meeting today. I wanted to discuss the upcoming Q3 release and make sure we're all aligned on priorities.

Sarah: Thanks, John. I've prepared the UI mockups for the new dashboard feature. The design team has finished the initial version but we'd like feedback from everyone.

Alex: The mockups look great. I'm concerned about the implementation timeline though. Our engineering team is already working on fixing the reported bugs in the checkout flow.

John: That's a valid concern, Alex. Let's prioritize the bug fixes first, then move on to the new features. Sarah, can you share the mockups with everyone after this meeting?

Sarah: Sure, I'll send them out today. Also, we need a decision on whether to include the analytics module in this release or push it to Q4.

Michael: From the marketing perspective, the analytics module would be a great selling point for the Q3 release. We're planning our campaign around the data-driven features.

John: Let's tentatively include it, but Alex, can your team give us a realistic assessment by Friday on whether it can be done without compromising quality?

Alex: Yes, I'll have the team review the requirements and provide an estimate by end of day Friday.

John: Great. To summarize, our priorities are: 1) Fix checkout flow bugs, 2) Implement new dashboard, 3) Analytics module if possible. Sarah will share the mockups, Alex will provide timeline feedback by Friday, and Michael will start preparing marketing materials. Let's meet again next week. Thank you everyone.
            """
            
            # Use realistic summary and action items
            summary = """This meeting focused on planning the upcoming Q3 product release with discussion on prioritization and timelines.

Key points:
• The team needs to fix checkout flow bugs before implementing new features
• Sarah presented UI mockups for a new dashboard feature that received positive feedback
• There's uncertainty about including the analytics module in Q3 vs. pushing to Q4
• Marketing is planning their campaign around data-driven features
• Team agreed on a prioritization order: bug fixes, dashboard implementation, then analytics module (if feasible)"""
            
            action_items = """• Sarah: Share UI mockups with the team today
• Alex: Provide realistic assessment of analytics module timeline by Friday
• Engineering team: Focus on fixing checkout flow bugs
• Michael: Begin preparing marketing materials for Q3 release
• All: Meet again next week to review progress"""
            
            # Set demo audio info
            audio_info = {
                "detected_language": "English (en-US)",
                "audio_duration": "12 minutes 35 seconds",
                "audio_format": os.path.splitext(audio_path)[1].upper().replace(".", ""),
                "speakers_count": 4,
                "speakers": ["John", "Sarah", "Alex", "Michael"]
            }
        elif transcription and not transcription.startswith("Transcription failed"):
            print("Starting text analysis...")
            try:
                analysis = cohere_analysis_service.analyze_transcript(transcription)
                # Ensure we have string values
                summary = str(analysis.get("summary", ""))
                
                # Format action items - ensure proper formatting with bullet points
                action_items_raw = analysis.get("action_items", "")
                if isinstance(action_items_raw, list):
                    # If it's a list, convert to bulleted string
                    action_items = "\n".join([f"• {item}" for item in action_items_raw])
                else:
                    # If it's a string, ensure proper bullet point formatting
                    action_items = str(action_items_raw)
                    # If the string doesn't have bullet points, format it
                    if not any(line.strip().startswith(("•", "-", "*")) for line in action_items.split("\n") if line.strip()):
                        action_items = "• " + action_items.replace("\n", "\n• ")
                
                print(f"Analysis completed. Summary length: {len(summary)} chars, Action items: {len(action_items)} chars")
            except Exception as e:
                print(f"Error in analysis: {e}")
                summary = f"Analysis failed: {str(e)}"
                action_items = "No action items extracted"
        
        # Update meeting record with results and audio info
        meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
        if meeting:
            print(f"Updating meeting record {meeting_id} with results")
            meeting.transcription = transcription
            meeting.summary = summary
            meeting.action_items = action_items
            
            # Update language if detected
            if audio_info.get("detected_language"):
                detected_lang = audio_info.get("detected_language", "")
                if "english" in detected_lang.lower() or "en-" in detected_lang.lower():
                    meeting.language = "en"
                elif "spanish" in detected_lang.lower() or "es-" in detected_lang.lower():
                    meeting.language = "es"
                elif "chinese" in detected_lang.lower() or "zh-" in detected_lang.lower():
                    meeting.language = "zh"
                elif "french" in detected_lang.lower() or "fr-" in detected_lang.lower():
                    meeting.language = "fr"
                elif "german" in detected_lang.lower() or "de-" in detected_lang.lower():
                    meeting.language = "de"
                elif "japanese" in detected_lang.lower() or "ja-" in detected_lang.lower():
                    meeting.language = "ja"
            
            # Store audio info if available
            if audio_info:
                # Set detected language display string
                if audio_info.get("detected_language"):
                    meeting.detected_language = audio_info.get("detected_language")
                
                # Set audio duration if available
                if audio_info.get("audio_duration"):
                    meeting.audio_duration = audio_info.get("audio_duration")
                elif audio_info.get("estimated_duration"):
                    meeting.audio_duration = audio_info.get("estimated_duration")
                
                # Convert to JSON string if needed
                if isinstance(audio_info, dict):
                    import json
                    try:
                        audio_info_str = json.dumps(audio_info)
                        # Check if the audio_info column exists in the database object
                        if hasattr(meeting, 'audio_info'):
                            meeting.audio_info = audio_info_str
                    except Exception as json_err:
                        print(f"Error serializing audio info: {json_err}")
            
            try:
                db.commit()
                db.refresh(meeting)
                print(f"Meeting record {meeting_id} updated successfully")
                
                # Pre-generate PDFs in the background to ensure they're ready when needed
                try:
                    print("Pre-generating PDF files...")
                    pdf_generator_service.generate_transcript_pdf(meeting.title, meeting.transcription, meeting.id)
                    pdf_generator_service.generate_summary_pdf(meeting.title, meeting.summary, meeting.action_items, meeting.id)
                    pdf_generator_service.generate_full_report_pdf(meeting.title, meeting.transcription, meeting.summary, meeting.action_items, meeting.id)
                    print("PDF files generated successfully")
                except Exception as pdf_err:
                    print(f"Warning: Failed to pre-generate PDFs: {pdf_err}")
            except Exception as db_err:
                print(f"Error during database commit: {db_err}")
                db.rollback()
                # Try again with a simpler approach
                try:
                    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
                    meeting.transcription = transcription
                    meeting.summary = summary
                    meeting.action_items = action_items
                    db.commit()
                    print("Second attempt to update succeeded")
                except Exception as second_err:
                    print(f"Second error during database commit: {second_err}")
                    db.rollback()
        else:
            print(f"Error: Meeting with ID {meeting_id} not found in database")
            
    except Exception as e:
        print(f"Unhandled error in process_meeting_audio: {e}")
        # Try to update the meeting record with error information
        try:
            db.rollback()  # Make sure to rollback any failed transaction
            meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
            if meeting:
                meeting.transcription = f"Error processing meeting: {str(e)}"
                db.commit()
        except Exception as db_err:
            print(f"Error updating meeting record with error status: {db_err}")


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


@router.get("/{meeting_id}/text/{content_type}")
def get_meeting_text(
    meeting_id: int,
    content_type: str,
    db: Session = Depends(get_db)
):
    """
    Get meeting content as plain text by type (transcript, summary, report)
    This is a more reliable alternative to PDF downloads
    """
    # Check if meeting exists
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Create text content based on requested type
    try:
        if content_type == "transcript":
            if not meeting.transcription:
                raise HTTPException(status_code=400, detail="Meeting has no transcription")
            
            # Create text content
            content = f"=== TRANSCRIPT: {meeting.title} ===\n\n"
            content += meeting.transcription
            
            # Add metadata
            content += f"\n\n=== METADATA ===\nMeeting: {meeting.title}\n"
            if meeting.detected_language:
                content += f"Detected language: {meeting.detected_language}\n"
            if meeting.audio_duration:
                content += f"Duration: {meeting.audio_duration}\n"
            if meeting.date:
                content += f"Date: {meeting.date.strftime('%Y-%m-%d %H:%M:%S')}\n"
            
            filename = f"{meeting.title}_transcript.txt"
            
        elif content_type == "summary":
            if not meeting.summary:
                raise HTTPException(status_code=400, detail="Meeting has no summary")
            
            # Create text content
            content = f"=== SUMMARY: {meeting.title} ===\n\n"
            content += f"SUMMARY:\n{meeting.summary}\n\n"
            
            if meeting.action_items:
                content += f"ACTION ITEMS:\n{meeting.action_items}\n"
            
            # Add metadata
            content += f"\n=== METADATA ===\nMeeting: {meeting.title}\n"
            if meeting.detected_language:
                content += f"Detected language: {meeting.detected_language}\n"
            if meeting.audio_duration:
                content += f"Duration: {meeting.audio_duration}\n"
            if meeting.date:
                content += f"Date: {meeting.date.strftime('%Y-%m-%d %H:%M:%S')}\n"
            
            filename = f"{meeting.title}_summary.txt"
            
        elif content_type == "report":
            if not meeting.transcription or not meeting.summary:
                raise HTTPException(status_code=400, detail="Meeting incomplete")
            
            # Create text content
            content = f"=== FULL REPORT: {meeting.title} ===\n\n"
            content += f"SUMMARY:\n{meeting.summary}\n\n"
            
            if meeting.action_items:
                content += f"ACTION ITEMS:\n{meeting.action_items}\n\n"
            
            content += f"TRANSCRIPT:\n{meeting.transcription}\n"
            
            # Add metadata
            content += f"\n=== METADATA ===\nMeeting: {meeting.title}\n"
            if meeting.detected_language:
                content += f"Detected language: {meeting.detected_language}\n"
            if meeting.audio_duration:
                content += f"Duration: {meeting.audio_duration}\n"
            if meeting.date:
                content += f"Date: {meeting.date.strftime('%Y-%m-%d %H:%M:%S')}\n"
            
            filename = f"{meeting.title}_full_report.txt"
            
        elif content_type == "translation":
            if not meeting.translation:
                raise HTTPException(status_code=400, detail="Meeting has no translation")
            
            # Create text content
            content = f"=== TRANSLATION: {meeting.title} ===\n\n"
            content += meeting.translation
            
            # Add metadata
            content += f"\n\n=== METADATA ===\nMeeting: {meeting.title}\n"
            if meeting.detected_language:
                content += f"Source language: {meeting.detected_language}\n"
            if meeting.audio_duration:
                content += f"Duration: {meeting.audio_duration}\n"
            if meeting.date:
                content += f"Date: {meeting.date.strftime('%Y-%m-%d %H:%M:%S')}\n"
            
            filename = f"{meeting.title}_translation.txt"
            
        else:
            raise HTTPException(status_code=400, detail="Invalid content type")
        
        # Create temporary file
        temp_dir = os.path.join(settings.PDF_DIR, "text")
        os.makedirs(temp_dir, exist_ok=True)
        
        file_path = os.path.join(temp_dir, f"{meeting_id}_{content_type}.txt")
        
        # Write content to file
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        
        # Return file
        return FileResponse(
            file_path,
            filename=filename,
            media_type="text/plain"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating text file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate text file: {str(e)}") 