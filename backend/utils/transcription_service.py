import os
from typing import Dict, Any, Optional
from .alibaba_asr import AlibabaASR

class TranscriptionService:
    """Service for transcribing audio files using Alibaba ASR"""
    
    def __init__(self, provider: str = "alibaba"):
        """
        Initialize the transcription service
        
        Args:
            provider: The ASR provider to use (only "alibaba" is supported now)
        """
        if provider != "alibaba":
            raise ValueError("Only 'alibaba' provider is supported")
            
        self.provider = provider
        
        # Get credentials from environment variables
        app_key = os.getenv("ALIBABA_ASR_APP_KEY")
        access_token = os.getenv("ALIBABA_ASR_TOKEN")
        
        if not all([app_key, access_token]):
            raise ValueError(
                "Missing Alibaba credentials. Please set ALIBABA_ASR_APP_KEY and "
                "ALIBABA_ASR_TOKEN environment variables."
            )
        
        self.alibaba_asr = AlibabaASR(
            app_key=app_key,
            access_token=access_token
        )
    
    def transcribe(self, audio_file_path: str, language: Optional[str] = None) -> Dict[str, Any]:
        """
        Transcribe an audio file
        
        Args:
            audio_file_path: Path to the audio file
            language: Language code (e.g., "en", "zh-cn", "zh-hk")
                     If None, will try to auto-detect language
        
        Returns:
            Dict with transcription results
        """
        return self._transcribe_with_alibaba(audio_file_path, language)
    
    def _transcribe_with_alibaba(self, audio_file_path: str, language: Optional[str] = None) -> Dict[str, Any]:
        """Use Alibaba ASR for transcription"""
        try:
            return self.alibaba_asr.transcribe_file(audio_file_path, language)
        except Exception as e:
            return {
                "status": "error",
                "message": f"Alibaba ASR error: {str(e)}"
            }

# Example usage:
# transcription_service = TranscriptionService(provider="alibaba")  # or "whisper"
# result = transcription_service.transcribe("path/to/audio.mp3", language="en") 