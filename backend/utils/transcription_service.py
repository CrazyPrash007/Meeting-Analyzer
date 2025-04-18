import os
import tempfile
from typing import Dict, Any, Optional
import whisper
from .alibaba_asr import AlibabaASR

class TranscriptionService:
    """Service for transcribing audio files using various ASR providers"""
    
    def __init__(self, provider: str = "whisper"):
        """
        Initialize the transcription service
        
        Args:
            provider: The ASR provider to use ("whisper" or "alibaba")
        """
        self.provider = provider
        
        # Initialize Alibaba ASR if selected
        if provider == "alibaba":
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
            
        # For Whisper, we'll load the model on demand to save memory
        self.whisper_model = None
        
    def _load_whisper_model(self, model_size: str = "medium"):
        """Load the Whisper model if not already loaded"""
        if self.whisper_model is None:
            self.whisper_model = whisper.load_model(model_size)
        return self.whisper_model
    
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
        if self.provider == "alibaba":
            return self._transcribe_with_alibaba(audio_file_path, language)
        else:  # Default to Whisper
            return self._transcribe_with_whisper(audio_file_path, language)
    
    def _transcribe_with_whisper(self, audio_file_path: str, language: Optional[str] = None) -> Dict[str, Any]:
        """Use OpenAI Whisper for transcription"""
        model = self._load_whisper_model()
        
        # Map our language codes to Whisper language codes if needed
        whisper_language = None
        if language == "zh-cn" or language == "zh-hk":
            whisper_language = "zh"
        elif language == "en":
            whisper_language = "en"
        
        # Transcribe with Whisper
        try:
            result = model.transcribe(
                audio_file_path, 
                language=whisper_language,
                task="transcribe"
            )
            
            return {
                "status": "success",
                "transcript_text": result["text"],
                "language": result["language"],
                "raw_result": result
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Whisper transcription error: {str(e)}"
            }
    
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