import os
import json
import time
from datetime import datetime
from typing import Optional, Dict, Any
import tempfile

from alibabacloud_nls20220525.client import Client as NlsClient
from alibabacloud_nls20220525.models import FileTranscriptionRequest
from alibabacloud_tea_openapi import models as open_api_models
from alibabacloud_tea_util import models as util_models
from alibabacloud_tea_util.client import Client as UtilClient

class AlibabaASR:
    def __init__(self, access_key_id: str, access_key_secret: str, app_key: str, region: str = "cn-shanghai"):
        """
        Initialize the Alibaba ASR client
        
        Args:
            access_key_id: Your Alibaba Cloud access key ID
            access_key_secret: Your Alibaba Cloud access key secret
            app_key: Your Alibaba ASR app key
            region: The region of Alibaba Cloud service (default: cn-shanghai)
        """
        self.access_key_id = access_key_id
        self.access_key_secret = access_key_secret
        self.app_key = app_key
        self.region = region
        self.client = self._create_client()
        
    def _create_client(self) -> NlsClient:
        """Create and initialize an Alibaba NLS client"""
        config = open_api_models.Config(
            access_key_id=self.access_key_id,
            access_key_secret=self.access_key_secret,
            region_id=self.region
        )
        config.endpoint = f'nls-meta.{self.region}.aliyuncs.com'
        return NlsClient(config)
    
    def transcribe_file(self, audio_file_path: str, language: str = None) -> Dict[str, Any]:
        """
        Transcribe an audio file using Alibaba ASR
        
        Args:
            audio_file_path: Path to the audio file
            language: Language code (e.g., "en", "zh-cn", "zh-hk")
                     If None, will try to auto-detect language
        
        Returns:
            Dict with transcription results
        """
        # Map language codes to Alibaba-specific language codes
        language_map = {
            "en": "en-US",
            "zh-cn": "zh-CN",
            "zh-hk": "zh-HK",
            None: None  # Auto-detect
        }
        
        asr_language = language_map.get(language, None)
        
        # Create the file transcription request
        file_link_request = FileTranscriptionRequest(
            app_key=self.app_key,
            file_link=self._prepare_file_url(audio_file_path),
            enable_word_info=True,
            enable_punctuation_prediction=True,
            enable_sentence_detection=True,
            auto_punctuation=True,
            file_format=self._get_file_format(audio_file_path)
        )
        
        # Set language if specified
        if asr_language:
            file_link_request.language = asr_language
            
        # Submit transcription request
        runtime = util_models.RuntimeOptions()
        response = self.client.submit_file_transcription_job(file_link_request, runtime)
        
        # Get task ID from response
        task_id = response.body.task_id
        
        # Poll for results
        return self._poll_for_results(task_id)
    
    def _prepare_file_url(self, file_path: str) -> str:
        """
        For a local file, this would need to upload to a temporary URL
        In a production environment, this would upload to OSS or other storage
        For this example, we'll assume the file is already accessible via URL
        
        In a real implementation, you would need to:
        1. Upload the file to Alibaba OSS
        2. Generate a temporary URL
        3. Return that URL
        
        For this example, we'll return a placeholder
        """
        # This is a placeholder - in a real implementation, upload to OSS
        return file_path
    
    def _get_file_format(self, file_path: str) -> str:
        """Determine the audio file format based on extension"""
        ext = os.path.splitext(file_path)[1].lower()
        format_map = {
            '.wav': 'wav',
            '.mp3': 'mp3',
            '.m4a': 'aac',
            '.aac': 'aac',
            '.ogg': 'ogg'
        }
        return format_map.get(ext, 'wav')
    
    def _poll_for_results(self, task_id: str, max_attempts: int = 60, interval: int = 5) -> Dict[str, Any]:
        """
        Poll for transcription results
        
        Args:
            task_id: The task ID returned from the transcription request
            max_attempts: Maximum number of polling attempts
            interval: Seconds between polling attempts
            
        Returns:
            Dict with transcription results
        """
        runtime = util_models.RuntimeOptions()
        
        for attempt in range(max_attempts):
            try:
                # Get task status
                response = self.client.get_file_transcription_result(task_id, runtime)
                status = response.body.status
                
                # Check if completed
                if status == "SUCCESS":
                    # Parse results
                    result = json.loads(response.body.result)
                    
                    # Extract the transcript
                    transcript = "".join([sentence.get("text", "") for sentence in result.get("sentences", [])])
                    
                    return {
                        "status": "success",
                        "transcript_text": transcript,
                        "language": response.body.language,
                        "raw_result": result
                    }
                elif status == "FAILED":
                    return {
                        "status": "error",
                        "message": "Transcription failed",
                        "error_code": response.body.status_text
                    }
                
                # Not complete yet, wait and retry
                time.sleep(interval)
            except Exception as e:
                return {
                    "status": "error",
                    "message": f"Error polling for results: {str(e)}"
                }
        
        # Max attempts reached
        return {
            "status": "error",
            "message": "Timeout waiting for transcription results"
        }

# Example usage:
# asr = AlibabaASR(
#     access_key_id="YOUR_ACCESS_KEY_ID",
#     access_key_secret="YOUR_ACCESS_KEY_SECRET",
#     app_key="YOUR_APP_KEY"
# )
# result = asr.transcribe_file("path/to/audio.mp3", language="en") 