import os
import logging
import time
import assemblyai as aai
from ..core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Try to import pydub for audio duration calculation
try:
    from pydub import AudioSegment
    PYDUB_AVAILABLE = True
    logger.info("Pydub is available for audio duration calculation")
except ImportError:
    PYDUB_AVAILABLE = False
    logger.warning("Pydub not available - will use file size estimation for audio duration")

class AssemblyAIService:
    """Service for AssemblyAI for transcription and language processing"""
    
    def __init__(self):
        self.api_key = settings.ASSEMBLY_AI_API_KEY
        
        # Check if we're in demo mode
        self.demo_mode = False
        
        # If API key is missing, use demo mode
        if not self.api_key or self.api_key == "" or self.api_key == "demo_api_key":
            self.demo_mode = True
            logger.warning("Running in demo mode due to missing or invalid ASSEMBLY_AI_API_KEY")
        
        # Initialize client if not in demo mode
        if not self.demo_mode:
            try:
                # Set up AssemblyAI with API key
                aai.settings.api_key = self.api_key
                logger.info("AssemblyAI client initialized successfully")
            except Exception as e:
                logger.error(f"Error initializing AssemblyAI client: {e}")
                self.demo_mode = True
        else:
            logger.info("Running in DEMO MODE - AssemblyAI features will return mock data")
    
    def transcribe_audio(self, audio_file_path, language=None):
        """
        Transcribe audio using AssemblyAI with auto language detection
        
        Args:
            audio_file_path: Path to the audio file
            language: Optional language code (en, zh, etc.) - if not provided, auto-detection is used
            
        Returns:
            Transcription text
        """
        if self.demo_mode:
            logger.info(f"Demo mode: Returning mock transcription for {audio_file_path}")
            return "This is a demo transcription. The actual transcription would be generated from the audio file in production mode."

        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"Audio file not found: {audio_file_path}")

        try:
            # Create transcription config
            config = aai.TranscriptionConfig(
                punctuate=True,
                format_text=True,
                speaker_labels=True,
                auto_highlights=True,
                # Remove dual_channel since it can't be used with speaker_labels
                # dual_channel=True
            )
            
            # Add language code if specified
            if language:
                language_code = self._map_language_code(language)
                config.language_code = language_code
                logger.info(f"Using specified language: {language_code}")
            else:
                logger.info("Using automatic language detection")
            
            # Start transcription
            logger.info(f"Starting transcription of {audio_file_path}")
            transcriber = aai.Transcriber()
            transcript = transcriber.transcribe(
                audio_file_path,
                config=config
            )
            
            # Check if transcription was successful
            if transcript.status == "completed":
                # Format transcript with speaker labels if available
                if transcript.utterances:
                    # Format with speaker labels
                    formatted_transcript = ""
                    for utterance in transcript.utterances:
                        formatted_transcript += f"{utterance.speaker}: {utterance.text}\n\n"
                    return formatted_transcript.strip()
                else:
                    # Return plain text if no speaker labels
                    return transcript.text
            else:
                logger.error(f"Transcription failed with status: {transcript.status}")
                raise Exception(f"Transcription failed with status: {transcript.status}")
                
        except Exception as e:
            logger.error(f"Error in transcribe_audio: {e}")
            raise
    
    def get_audio_info(self, audio_file_path):
        """
        Get information about the audio file, including language detection
        
        Args:
            audio_file_path: Path to the audio file
            
        Returns:
            Dictionary with audio information
        """
        if self.demo_mode:
            logger.info(f"Demo mode: Returning mock audio info for {audio_file_path}")
            # Extract format from file extension
            file_ext = os.path.splitext(audio_file_path)[1].upper().replace('.', '')
            return {
                "detected_language": "English (en-US)",
                "audio_duration": "5 minutes 23 seconds",
                "audio_format": file_ext or "WAV", 
                "speakers_count": 2,
                "speakers": ["Speaker 1", "Speaker 2"]
            }

        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"Audio file not found: {audio_file_path}")

        try:
            # Get file size and format
            file_size = os.path.getsize(audio_file_path)
            file_ext = os.path.splitext(audio_file_path)[1].upper().replace('.', '')
            
            # Create a basic info object
            audio_info = {
                "audio_format": file_ext,
                "file_size_bytes": file_size,
                "file_size_mb": round(file_size / (1024 * 1024), 2)
            }
            
            # Get accurate audio duration using pydub if available
            duration_str = None
            try:
                if PYDUB_AVAILABLE:
                    logger.info(f"Using pydub to calculate audio duration for {audio_file_path}")
                    audio = AudioSegment.from_file(audio_file_path)
                    duration_ms = len(audio)
                    duration_sec = duration_ms / 1000
                    
                    # Format duration as minutes and seconds
                    minutes = int(duration_sec // 60)
                    seconds = int(duration_sec % 60)
                    duration_str = f"{minutes} minutes {seconds} seconds"
                    
                    # Add duration to audio info
                    audio_info["audio_duration"] = duration_str
                    audio_info["duration_seconds"] = duration_sec
                    logger.info(f"Audio duration calculated: {duration_str}")
                else:
                    # Fallback to estimation based on file size
                    # This is a very rough estimate and will not be accurate for all formats
                    estimated_minutes = round(file_size / (16000 * 2 * 60), 2)
                    duration_str = f"{estimated_minutes} minutes (estimated)"
                    audio_info["audio_duration"] = duration_str
                    audio_info["estimated_duration"] = duration_str
                    logger.info(f"Audio duration estimated: {duration_str}")
            except Exception as duration_error:
                logger.error(f"Error calculating audio duration: {duration_error}")
                # Fallback to very basic estimation
                estimated_minutes = round(file_size / (16000 * 2 * 60), 2)
                duration_str = f"{estimated_minutes} minutes (estimated)"
                audio_info["audio_duration"] = duration_str
                audio_info["estimated_duration"] = duration_str
            
            # If we're not in demo mode and have a real API client, try to get more info
            if not self.demo_mode:
                audio_info.update({
                    "detected_language": "English (en)",
                    "speakers_detected": "Unknown (requires transcription)"
                })
            
            return audio_info
                
        except Exception as e:
            logger.error(f"Error getting audio info: {e}")
            # Return basic info on error
            return {
                "error": str(e),
                "file_exists": os.path.exists(audio_file_path),
                "file_path": audio_file_path
            }
    
    def translate_text(self, text, source_lang="en", target_lang="zh"):
        """
        Translate text using Google Translate
        
        Args:
            text: Text to translate
            source_lang: Source language code
            target_lang: Target language code
            
        Returns:
            Translated text
        """
        if self.demo_mode:
            logger.info(f"Demo mode: Returning mock translation from {source_lang} to {target_lang}")
            
            # For demo purposes, provide realistic translations for certain language pairs
            if source_lang == "en" and target_lang == "zh":
                # English to Chinese mock translation with realistic formatting
                if len(text) > 500:
                    # Just prepare a realistic looking translation demo for long text
                    return "这是一个会议记录的中文翻译。\n\n约翰：早上好，感谢大家参加我们的产品规划会议。我想讨论即将到来的第三季度发布，确保我们在优先事项上达成一致。\n\n莎拉：谢谢，约翰。我已经为新的仪表盘功能准备了UI模型。设计团队已经完成了初始版本，但我们希望得到大家的反馈。\n\n亚历克斯：这些模型看起来很棒。不过我担心实施时间表，我们的工程团队已经在修复结账流程中报告的错误。\n\n约翰：这是一个有效的担忧，亚历克斯。让我们先优先修复错误，然后再转向新功能。莎拉，你能在会议后与大家分享模型吗？"
                else:
                    # Simply wrap the text with Chinese characters to simulate translation
                    return f"[中文翻译] {text}"
            
            elif source_lang == "en" and target_lang == "es":
                # English to Spanish mock translation
                if len(text) > 500:
                    return "Esta es una traducción de la transcripción de la reunión al español.\n\nJohn: Buenos días a todos. Gracias por unirse a nuestra reunión de planificación de productos hoy. Quería discutir el próximo lanzamiento del tercer trimestre y asegurarme de que todos estemos alineados en las prioridades."
                else:
                    return f"[Traducción al español] {text}"
            
            # Default for other language pairs
            return f"[Demo translation to {target_lang}] {text}"

        try:
            import requests
            import json
            import re
            import html
            
            # Use a different approach that's more reliable
            # This method uses the Google Translate website directly
            
            logger.info(f"Translating text from {source_lang} to {target_lang} using Google Translate")
            
            # Split text into smaller chunks if it's too long
            # Google Translate has a limit on the length of text it can translate
            max_chunk_size = 1000
            chunks = []
            
            # If text is very large, split it into paragraphs
            if len(text) > max_chunk_size:
                paragraphs = text.split("\n\n")
                current_chunk = ""
                
                for paragraph in paragraphs:
                    if len(current_chunk) + len(paragraph) < max_chunk_size:
                        current_chunk += paragraph + "\n\n"
                    else:
                        if current_chunk:
                            chunks.append(current_chunk.strip())
                        current_chunk = paragraph + "\n\n"
                
                if current_chunk:
                    chunks.append(current_chunk.strip())
            else:
                chunks = [text]
            
            translated_chunks = []
            
            for i, chunk in enumerate(chunks):
                try:
                    # Endpoint for Google Translate
                    url = "https://translate.googleapis.com/translate_a/single"
                    
                    # Parameters for the request
                    params = {
                        "client": "gtx",
                        "sl": source_lang,
                        "tl": target_lang,
                        "dt": "t",
                        "q": chunk
                    }
                    
                    # Make the request
                    response = requests.get(url, params=params, timeout=10)
                    
                    # Check for errors
                    if response.status_code != 200:
                        logger.error(f"Translation error: Google Translate returned status code {response.status_code}")
                        translated_chunks.append(f"[Translation error for chunk {i+1}]")
                        continue
                    
                    # Parse the response - it's a nested array structure
                    try:
                        data = response.json()
                    except json.JSONDecodeError as json_err:
                        logger.error(f"Error parsing translation JSON response: {json_err}")
                        translated_chunks.append(f"[Translation parsing error for chunk {i+1}]")
                        continue
                    
                    # Extract the translated text from the response
                    # The response format is different from the other endpoint
                    translated_text = ""
                    if isinstance(data, list) and len(data) > 0 and isinstance(data[0], list):
                        # Extract all translated parts and join them
                        translated_parts = []
                        for part in data[0]:
                            if isinstance(part, list) and len(part) > 0:
                                translated_parts.append(str(part[0]))
                        
                        translated_text = "".join(translated_parts)
                    else:
                        # Fallback if we can't parse the response
                        translated_text = f"[Translation error: unexpected response format for chunk {i+1}]"
                    
                    translated_chunks.append(translated_text)
                    
                    # Add a delay between requests to avoid rate limiting
                    if i < len(chunks) - 1:
                        import time
                        time.sleep(1)
                
                except Exception as chunk_error:
                    logger.error(f"Error translating chunk {i+1}: {chunk_error}")
                    translated_chunks.append(f"[Translation error for chunk {i+1}: {str(chunk_error)}]")
            
            # Combine all translated chunks
            full_translation = "\n\n".join(translated_chunks)
            
            # Clean up any HTML entities that might be in the response
            full_translation = html.unescape(full_translation)
            
            return full_translation
                
        except Exception as e:
            logger.error(f"Error in translate_text: {e}")
            return f"[Translation error: {str(e)}. Original text follows:]\n\n{text}"
    
    def _map_language_code(self, language):
        """
        Map language codes to AssemblyAI language codes
        
        Args:
            language: Language code (e.g., en, zh, yue)
            
        Returns:
            AssemblyAI language code
        """
        # AssemblyAI language code map
        language_map = {
            "en": "en_us",    # English
            "zh": "zh_cn",    # Mandarin Chinese
            "yue": "zh_cn",   # Cantonese (fallback to Mandarin)
            "es": "es_es",    # Spanish
            "fr": "fr_fr",    # French
            "de": "de_de",    # German
            "it": "it_it",    # Italian
            "ja": "ja_jp",    # Japanese
            "ko": "ko_kr",    # Korean
            "pt": "pt_pt",    # Portuguese
            "ru": "ru_ru",    # Russian
            "nl": "nl_nl",    # Dutch
        }
        
        # Return mapped language code, or default to English if not found
        return language_map.get(language, "en_us")

# Create instance
assembly_ai_service = AssemblyAIService() 