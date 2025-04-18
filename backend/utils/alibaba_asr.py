import os
import json
import time
import requests
from typing import Optional, Dict, Any

class AlibabaASR:
    """Client for Alibaba Cloud ASR service using direct API integration"""
    
    def __init__(self, app_key: str = None, access_token: str = None):
        """
        Initialize the Alibaba ASR client
        
        Args:
            app_key: Your Alibaba ASR app key
            access_token: Your Alibaba ASR access token
        """
        # Use provided values or fetch from environment variables
        self.app_key = app_key or os.getenv("ALIBABA_ASR_APP_KEY", "PVefghdfzhdfhzzh")
        self.access_token = access_token or os.getenv("ALIBABA_ASR_TOKEN", "xhhtryry5474sherbzerd5")
        self.api_endpoint = "https://nls-gateway-cn-shanghai.aliyuncs.com/stream/v1/file"
    
    def transcribe_file(self, audio_file_path: str, language: str = None) -> Dict[str, Any]:
        """
        Transcribe an audio file using Alibaba ASR
        
        Args:
            audio_file_path: Path to the audio file
            language: Language code (e.g., "en", "zh-cn", "zh-hk")
                     Currently not used as the API auto-detects language
        
        Returns:
            Dict with transcription results
        """
        try:
            # Determine file format
            file_format = self._get_file_format(audio_file_path)
            
            # Prepare API parameters
            params = {
                "appkey": self.app_key,
                "token": self.access_token,
                "format": file_format,
                "sample_rate": "16000"  # Default sample rate
            }
            
            # Add language parameter if specified and API supports it
            # Note: Current API documentation doesn't mention language parameter
            
            # Prepare headers
            headers = {
                "Content-Type": "application/octet-stream"
            }
            
            # Read the audio file in binary mode
            with open(audio_file_path, "rb") as audio_file:
                audio_content = audio_file.read()
            
            # Send the API request
            response = requests.post(
                self.api_endpoint,
                params=params,
                headers=headers,
                data=audio_content
            )
            
            # Check if request was successful
            if response.status_code == 200:
                result = response.json()
                
                # Check if the API returned a success status
                if result.get("status") == 20000000:
                    return {
                        "status": "success",
                        "transcript_text": result.get("result", ""),
                        "language": "auto-detected",  # API doesn't return language info
                        "raw_result": result
                    }
                else:
                    return {
                        "status": "error",
                        "message": f"API error: {result.get('message', 'Unknown error')}",
                        "error_code": result.get("status")
                    }
            else:
                return {
                    "status": "error",
                    "message": f"API request failed with status code: {response.status_code}",
                    "raw_response": response.text
                }
                
        except Exception as e:
            return {
                "status": "error",
                "message": f"Error transcribing file: {str(e)}"
            }
    
    def _get_file_format(self, file_path: str) -> str:
        """Determine the audio file format based on extension"""
        ext = os.path.splitext(file_path)[1].lower()
        format_map = {
            '.wav': 'wav',
            '.mp3': 'mp3',
            '.pcm': 'pcm'
        }
        return format_map.get(ext, 'wav')

# Example usage:
# asr = AlibabaASR()
# result = asr.transcribe_file("path/to/audio.mp3") 