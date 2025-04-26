from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import datetime
import os
import shutil
from ..core.config import settings

# Check if database exists in old location and migrate if needed
def migrate_database_if_needed():
    old_db_path = os.path.join(os.getcwd(), "meetings.db")
    if os.path.exists(old_db_path):
        print(f"Found database in old location: {old_db_path}")
        try:
            # Ensure the data directory exists
            os.makedirs(settings.DATA_DIR, exist_ok=True)
            
            # Copy the database to the new location
            new_db_path = os.path.join(settings.DATA_DIR, "meetings.db")
            
            # Don't overwrite if destination already exists
            if not os.path.exists(new_db_path):
                shutil.copy2(old_db_path, new_db_path)
                print(f"Database migrated to new location: {new_db_path}")
            else:
                print(f"Database already exists in new location: {new_db_path}")
                
            # Rename the old file for backup
            backup_path = os.path.join(os.getcwd(), "meetings.db.backup")
            os.rename(old_db_path, backup_path)
            print(f"Old database backed up to: {backup_path}")
            
        except Exception as e:
            print(f"Error migrating database: {e}")
            print("Will use database in old location")

# Try to migrate the database if needed
migrate_database_if_needed()

# Create SQLite database engine with path in data directory
DB_FILE = os.path.join(settings.DATA_DIR, "meetings.db")
DATABASE_URL = f"sqlite:///{DB_FILE}"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Create sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Define Meeting model
class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    timezone = Column(String, default="UTC")  # Store timezone information
    audio_path = Column(String)
    audio_info = Column(Text, nullable=True)  # JSON string with audio file information
    transcription = Column(Text, nullable=True)
    translation = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    action_items = Column(Text, nullable=True)
    language = Column(String, default="en")
    detected_language = Column(String, nullable=True)  # Human-readable detected language
    audio_duration = Column(String, nullable=True)  # Duration of the audio file
    
    # Define relationship with PDFs
    pdfs = relationship("PDF", back_populates="meeting", cascade="all, delete-orphan")

# Define PDF model for storing generated PDF files
class PDF(Base):
    __tablename__ = "pdfs"
    
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    file_path = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    pdf_type = Column(String)  # 'transcription', 'translation', 'summary', etc.
    
    # Define relationship with Meeting
    meeting = relationship("Meeting", back_populates="pdfs")

# Function to check and add missing columns to the database
def update_database_schema():
    import sqlite3
    
    try:
        print("Checking database schema for updates...")
        
        # Connect to SQLite database
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # Get current columns in the meetings table
        cursor.execute("PRAGMA table_info(meetings)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Check if required columns exist and add them if they don't
        if "audio_info" not in columns:
            print("Adding missing 'audio_info' column to meetings table...")
            cursor.execute("ALTER TABLE meetings ADD COLUMN audio_info TEXT")
            conn.commit()
        
        if "detected_language" not in columns:
            print("Adding missing 'detected_language' column to meetings table...")
            cursor.execute("ALTER TABLE meetings ADD COLUMN detected_language TEXT")
            conn.commit()
        
        if "audio_duration" not in columns:
            print("Adding missing 'audio_duration' column to meetings table...")
            cursor.execute("ALTER TABLE meetings ADD COLUMN audio_duration TEXT")
            conn.commit()
            
        if "timezone" not in columns:
            print("Adding missing 'timezone' column to meetings table...")
            cursor.execute("ALTER TABLE meetings ADD COLUMN timezone TEXT DEFAULT 'UTC'")
            conn.commit()
        
        print("Database schema updates completed.")
        
        # Close connection
        conn.close()
        
    except Exception as e:
        print(f"Error updating database schema: {e}")

# Create all tables
Base.metadata.create_all(bind=engine)

# Update database schema if needed
update_database_schema()

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 