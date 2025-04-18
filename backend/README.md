# Multilingual Meeting Note-Taking App Backend

This is the backend for the Multilingual Meeting Note-Taking app, which supports transcription of audio files in multiple languages, including English, Mandarin, and Cantonese.

## Setup

1. Install dependencies:
```
pip install -r requirements.txt
```

2. Create a `.env` file based on `.env.example` and fill in your credentials.

3. Run the server:
```
uvicorn main:app --reload
```

## Alibaba ASR Integration

The application supports two transcription engines:
- OpenAI Whisper (default)
- Alibaba Cloud ASR

### Setting up Alibaba ASR

1. Create an Alibaba Cloud account at https://www.alibabacloud.com/
2. Obtain your Access Key ID and Access Key Secret from the Alibaba Cloud console
3. Subscribe to the Alibaba Cloud Speech Recognition service
4. Create an ASR application and obtain the App Key
5. Add these credentials to your `.env` file:
```
ALIBABA_ACCESS_KEY_ID=your_access_key_id
ALIBABA_ACCESS_KEY_SECRET=your_access_key_secret
ALIBABA_ASR_APP_KEY=your_asr_app_key
ALIBABA_REGION=cn-shanghai
```
6. Set the ASR provider to use Alibaba:
```
ASR_PROVIDER=alibaba
```

### Language Support

The transcription service supports the following languages:
- English (`en`)
- Mandarin Chinese (`zh-cn`)
- Cantonese (`zh-hk`)

### Technical Notes

- For file uploads, Alibaba ASR requires the audio file to be accessible via a URL. In a production environment, you would need to implement file uploading to Alibaba OSS or another cloud storage service.
- The current implementation has a placeholder for this functionality.
- By default, the application will fall back to Whisper for transcription if Alibaba credentials are not provided.

## API Endpoints

- `POST /api/transcriptions/`: Upload and transcribe an audio file
- `GET /api/transcriptions/{id}`: Get a transcription by ID

## File Structure

```
backend/
├── api/
│   └── routes/
│       └── transcription_router.py
├── database/
│   └── database.py
├── models/
│   └── transcription.py
├── utils/
│   ├── alibaba_asr.py
│   └── transcription_service.py
├── .env
├── .env.example
├── main.py
└── requirements.txt
``` 