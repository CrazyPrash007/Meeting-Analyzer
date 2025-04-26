"""
Test script for audio duration calculation.
This script tests the audio duration calculation using pydub.
"""

import os
import sys
import argparse
import logging

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Try to import pydub
try:
    from pydub import AudioSegment
    PYDUB_AVAILABLE = True
    logger.info("Pydub is available for audio duration calculation")
except ImportError:
    PYDUB_AVAILABLE = False
    logger.error("Pydub is not available. Please install it with: pip install pydub")
    logger.error("Also ensure FFmpeg is installed on your system.")
    sys.exit(1)

def calculate_duration(audio_file_path):
    """Calculate the duration of an audio file using pydub."""
    try:
        if not os.path.exists(audio_file_path):
            logger.error(f"File not found: {audio_file_path}")
            return None
            
        logger.info(f"Loading audio file: {audio_file_path}")
        audio = AudioSegment.from_file(audio_file_path)
        duration_ms = len(audio)
        duration_sec = duration_ms / 1000
        
        # Format duration as minutes and seconds
        minutes = int(duration_sec // 60)
        seconds = int(duration_sec % 60)
        duration_str = f"{minutes} minutes {seconds} seconds"
        
        logger.info(f"Audio duration: {duration_str} ({duration_sec:.2f} seconds)")
        
        # Return all formats
        return {
            "duration_str": duration_str,
            "duration_seconds": duration_sec,
            "duration_ms": duration_ms,
            "minutes": minutes,
            "seconds": seconds
        }
    except Exception as e:
        logger.error(f"Error calculating audio duration: {e}")
        return None

def estimate_duration_from_filesize(audio_file_path):
    """Estimate duration based on file size (the old method)."""
    try:
        if not os.path.exists(audio_file_path):
            logger.error(f"File not found: {audio_file_path}")
            return None
            
        file_size = os.path.getsize(audio_file_path)
        logger.info(f"File size: {file_size} bytes ({file_size/1024/1024:.2f} MB)")
        
        # Estimate based on 16kHz 16-bit stereo audio (4 bytes per sample)
        estimated_seconds = file_size / (16000 * 2 * 2)
        estimated_minutes = estimated_seconds / 60
        
        logger.info(f"Estimated duration: {estimated_minutes:.2f} minutes ({estimated_seconds:.2f} seconds)")
        
        return {
            "estimated_minutes": estimated_minutes,
            "estimated_seconds": estimated_seconds,
            "estimated_str": f"{int(estimated_minutes)} minutes {int(estimated_seconds % 60)} seconds (estimated)"
        }
    except Exception as e:
        logger.error(f"Error estimating duration: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Test audio duration calculation")
    parser.add_argument("audio_file", help="Path to the audio file")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose output")
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    audio_file_path = args.audio_file
    
    logger.info(f"Testing audio duration calculation for: {audio_file_path}")
    
    # Check if file exists
    if not os.path.exists(audio_file_path):
        logger.error(f"Audio file not found: {audio_file_path}")
        sys.exit(1)
    
    # Get file information
    file_ext = os.path.splitext(audio_file_path)[1].upper().replace('.', '')
    logger.info(f"File format: {file_ext}")
    
    # Calculate duration using pydub
    logger.info("Calculating duration using pydub...")
    duration = calculate_duration(audio_file_path)
    
    # Estimate duration using file size
    logger.info("Estimating duration using file size...")
    estimated = estimate_duration_from_filesize(audio_file_path)
    
    # Print comparison
    if duration and estimated:
        logger.info("\n----- RESULTS -----")
        logger.info(f"Actual duration: {duration['duration_str']} ({duration['duration_seconds']:.2f} seconds)")
        logger.info(f"Estimated duration: {estimated['estimated_str']} ({estimated['estimated_seconds']:.2f} seconds)")
        
        # Calculate difference
        diff_seconds = abs(duration['duration_seconds'] - estimated['estimated_seconds'])
        diff_percent = (diff_seconds / duration['duration_seconds']) * 100 if duration['duration_seconds'] > 0 else 0
        
        logger.info(f"Difference: {diff_seconds:.2f} seconds ({diff_percent:.2f}%)")
        
        if diff_percent > 10:
            logger.warning("The difference is significant (>10%). The estimation method is not accurate.")
        else:
            logger.info("The difference is acceptable (<10%). The estimation method is reasonably accurate.")

if __name__ == "__main__":
    main() 