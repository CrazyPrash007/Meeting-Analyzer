import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.asyncio import AsyncEngine

# Database URL (using SQLite for simplicity)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./app.db")

# Create async engine
engine = create_async_engine(DATABASE_URL, future=True, echo=True)

# Create async session factory
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for models
Base = declarative_base()

# Function to get a database session
async def get_db():
    """Get async database session"""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()

# Initialize database with tables
async def init_db():
    """Create all tables in the database"""
    async with engine.begin() as conn:
        # Import models here to ensure they're registered with Base
        from ..models.transcription import Transcription
        
        # Create tables
        await conn.run_sync(Base.metadata.create_all) 