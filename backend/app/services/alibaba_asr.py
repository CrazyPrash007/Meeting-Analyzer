import requests
import json
import time
import os
try:
    from aliyunsdkcore.client import AcsClient
    from aliyunsdkcore.request import CommonRequest
    DEMO_MODE = False
except ImportError:
    DEMO_MODE = True
    print("Running in DEMO MODE - Alibaba ASR features will return mock data")

from ..core.config import settings

class AlibabaASRService:
    """Service for Alibaba Cloud ASR for transcription and translation"""
    
    def __init__(self):
        self.app_key = settings.ALIBABA_CLOUD_APP_KEY
        self.access_token = settings.ALIBABA_CLOUD_ACCESS_TOKEN
        if not DEMO_MODE:
            self.client = AcsClient(self.app_key, self.access_token, "cn-shanghai")
        else:
            self.client = None
    
    def transcribe_audio(self, audio_file_path, language="en"):
        """
        Transcribe audio using Alibaba Cloud ASR
        
        Args:
            audio_file_path: Path to the audio file
            language: Language code (en, zh, yue, etc.)
            
        Returns:
            Transcription text
        """
        if DEMO_MODE:
            # Return demo transcription
            return "This is a demo transcription. The actual transcription would be generated from the audio file in production mode."

        # Prepare the request
        request = CommonRequest()
        request.set_domain('nls-meta.cn-shanghai.aliyuncs.com')
        request.set_version('2019-02-28')
        request.set_action_name('CreateTask')
        request.set_method('POST')
        
        # Get file URL (in a real implementation, you'd upload to OSS and get URL)
        # For demo purposes, we're assuming the file is accessible
        file_url = f"file://{os.path.abspath(audio_file_path)}"
        
        # Set parameters
        request.add_body_params('appKey', self.app_key)
        request.add_body_params('fileLink', file_url)
        request.add_body_params('version', '4.0')
        request.add_body_params('format', 'wav')  # Adjust based on file format
        
        # Set language
        if language == "zh":
            request.add_body_params('language', 'zh_cn')
        elif language == "yue":
            request.add_body_params('language', 'zh_hk')  # Using Hong Kong Chinese for Cantonese
        else:
            request.add_body_params('language', 'en_us')
        
        # Execute request
        response = self.client.do_action_with_exception(request)
        response_dict = json.loads(response)
        
        # Get task ID
        task_id = response_dict.get('id')
        
        # Poll for results
        transcription = self._poll_for_results(task_id)
        return transcription
    
    def translate_text(self, text, source_lang="en", target_lang="zh"):
        """
        Translate text using Alibaba Cloud Translation
        
        Args:
            text: Text to translate
            source_lang: Source language code
            target_lang: Target language code
            
        Returns:
            Translated text
        """
        if DEMO_MODE:
            # Return demo translation
            return f"This is a demo translation to {target_lang}. The actual translation would be generated from the source text in production mode."

        # Prepare the request
        request = CommonRequest()
        request.set_domain('mt.cn-hangzhou.aliyuncs.com')
        request.set_version('2018-10-12')
        request.set_action_name('TranslateGeneral')
        request.set_method('POST')
        
        # Set parameters
        request.add_body_params('FormatType', 'text')
        request.add_body_params('SourceLanguage', source_lang)
        request.add_body_params('TargetLanguage', target_lang)
        request.add_body_params('SourceText', text)
        
        # Execute request
        response = self.client.do_action_with_exception(request)
        response_dict = json.loads(response)
        
        # Return translated text
        return response_dict.get('Data', {}).get('Translated')
    
    def _poll_for_results(self, task_id, max_retries=30, delay=5):
        """
        Poll for ASR task results
        
        Args:
            task_id: Task ID to poll
            max_retries: Maximum number of retries
            delay: Delay between retries in seconds
            
        Returns:
            Transcription text or None if failed
        """
        if DEMO_MODE:
            return "This is a demo transcription result."

        request = CommonRequest()
        request.set_domain('nls-meta.cn-shanghai.aliyuncs.com')
        request.set_version('2019-02-28')
        request.set_action_name('GetTaskResult')
        request.set_method('GET')
        
        # Set parameters
        request.add_query_param('appKey', self.app_key)
        request.add_query_param('id', task_id)
        
        for _ in range(max_retries):
            try:
                response = self.client.do_action_with_exception(request)
                response_dict = json.loads(response)
                
                status = response_dict.get('status')
                if status == "SUCCESS":
                    # Extract transcription text
                    result = response_dict.get('result', {})
                    transcription = result.get('sentences', [])
                    text = ' '.join([sentence.get('text', '') for sentence in transcription])
                    return text
                elif status == "FAILED":
                    return None
                
                # Wait before the next poll
                time.sleep(delay)
            except Exception as e:
                print(f"Error polling for results: {e}")
                time.sleep(delay)
        
        return None


# Create instance
alibaba_asr_service = AlibabaASRService() 