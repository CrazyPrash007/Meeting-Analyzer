# Multilingual Meeting Note-Taking AI Agent

A comprehensive tool for transcribing, summarizing, and extracting key information from multilingual meetings in English, Mandarin, and Cantonese.

## Features

- **Audio Transcription**: Upload pre-recorded audio files and get accurate transcriptions in multiple languages
- **Smart Summarization**: Generate concise summaries of meeting content
- **Action Item Extraction**: Automatically identify and list action items assigned during the meeting
- **Decision Tracking**: Extract key decisions made during meetings
- **Multilingual Support**: Works with English, Mandarin Chinese, and Cantonese
- **Searchable Database**: Find relevant information across all transcribed meetings
- **PDF Export**: Generate professional meeting reports in PDF format

## Technology Stack

- **Frontend**: React with TypeScript
- **Backend**: FastAPI
- **Transcription**: OpenAI Whisper (with option for Alibaba Cloud ASR)
- **Summarization**: LangChain with DeepSeek (with option for Qwen)
- **Database**: SQLite
- **PDF Generation**: FPDF

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   - Create a `.env` file in the backend directory
   - Add your HuggingFace API token (for DeepSeek LLM access):
     ```
     HUGGINGFACE_API_TOKEN=your_huggingface_token
     ```

4. Start the backend server:
   ```
   uvicorn main:app --reload
   ```
   The API will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install the required dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```
   The application will be available at http://localhost:3000

## Usage Guide

1. **Upload Audio**: Click the upload button and select your meeting audio file
2. **Select Language** (optional): Choose the primary language of the audio (auto-detect available)
3. **Transcribe**: The system will process the audio and display the transcript
4. **Generate Summary**: Click to analyze the transcript and generate a summary, action items, and decisions
5. **Search**: Use the search function to find specific topics or keywords across all meetings
6. **Export**: Generate a PDF report with the summary, action items, and full transcript

## Project Structure

```
.
├── backend/
│   ├── api/                 # API routes and endpoints
│   ├── database/            # Database models and connection
│   ├── models/              # Pydantic models and schemas
│   ├── services/            # Business logic
│   ├── utils/               # Helper utilities
│   ├── main.py              # FastAPI application 
│   └── requirements.txt     # Python dependencies
│
└── frontend/
    ├── public/              # Static assets
    ├── src/                 # React components and logic
    ├── package.json         # Node.js dependencies
    └── tsconfig.json        # TypeScript configuration
```

## Development Notes

- For local development, sample audio files are provided in the `backend/sample_audio` directory
- The system is configured to use a SQLite database for simplicity, but can be extended to use other databases
- DeepSeek is used as the default LLM, but the code includes commented alternatives for Qwen

## License

This project is licensed under the MIT License - see the LICENSE file for details. 