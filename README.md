# Meeting Analyzer

A web application that analyzes meeting audio by transcribing, translating, summarizing, and extracting action items. Users can view and download the analyzed content as PDF files.

## Features

- **Audio Transcription**: Transcribe meeting audio using Alibaba Cloud ASR
- **Translation**: Translate transcriptions to multiple languages
- **Summary Generation**: Automatically generate meeting summaries using Cohere AI
- **Action Item Extraction**: Extract action items and assignments from the meeting content
- **PDF Export**: Download transcriptions, translations, summaries, and action items as PDF files

## Technology Stack

- **Frontend**: React, Material-UI
- **Backend**: FastAPI, SQLite
- **AI Services**: 
  - AssemblyAI for transcription 
  - Cohere AI for summarization and action item extraction
- **PDF Generation**: ReportLab

## Project Structure

```
meeting-analyzer/
├── frontend/                 # React frontend
│   ├── public/               # Public assets
│   └── src/                  # Source code
│       ├── components/       # Reusable React components
│       ├── pages/            # Page components
│       └── services/         # API services
├── backend/                  # FastAPI backend
│   ├── app/                  # Application code
│   │   ├── api/              # API endpoints
│   │   ├── core/             # Core configuration
│   │   ├── db/               # Database models and connection
│   │   └── services/         # Business logic services
│   ├── data/                 # Database storage (created on runtime)
│   ├── main.py               # Entry point for running the application
│   ├── uploads/              # Uploaded audio files (created on runtime)
│   └── pdfs/                 # Generated PDF files (created on runtime)
```

## Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn
- Alibaba Cloud account with ASR service activated (for production)
- Cohere AI API key (for production)

## Setup Instructions

### API Keys

The application requires the following API keys to function properly:

1. **AssemblyAI** for speech-to-text transcription
   - Create an account at [AssemblyAI](https://www.assemblyai.com/)
   - Get your API key from the AssemblyAI dashboard

2. **Cohere AI** for text analysis, summarization, and action item extraction
   - Create an account at [Cohere](https://cohere.ai/)
   - Get your API key from the Cohere dashboard

Create a `.env` file in the `backend` directory with the following content:

```
# AssemblyAI API Key
ASSEMBLY_AI_API_KEY=your_assembly_ai_api_key_here

# Cohere API Key
COHERE_API_KEY=your_cohere_api_key_here
```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   python -m uvicorn main:app --reload
   ```

2. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

### Troubleshooting

If you encounter any issues:

1. Check the backend console for error messages
2. Verify that your API keys are correctly set in the `.env` file
3. Make sure all dependencies are installed
4. If meetings data isn't showing, check that the backend server is running properly

## Demo Mode

The application can run in "demo mode" without requiring actual API keys. In this mode:

- Transcription and translation services return placeholder text
- AI analysis for summaries and action items uses pre-defined examples
- PDF generation creates text files instead of proper PDFs

To run in demo mode, make sure you have the .env file with placeholder values:

```
ASSEMBLY_AI_API_KEY=demo_assembly_ai_api_key
COHERE_API_KEY=demo_cohere_api_key
```

This is useful for testing the application flow without needing to set up actual API credentials.

## Usage

1. **Upload Meeting Audio**
   - Go to the Upload page
   - Enter a meeting title
   - Select the audio language
   - Upload your meeting audio file (MP3, WAV, etc.)
   - Click "Upload & Analyze"

2. **View Meeting Analysis**
   - Go to the My Meetings page to see all your uploaded meetings
   - Click on a meeting to view its details
   - Navigate through the tabs to see transcription, translation, summary, and action items

3. **Translate Meeting**
   - In the meeting details page, go to the Transcription tab
   - Select the target language from the dropdown
   - Click "Translate"

4. **Download PDF**
   - Each tab has a "Download PDF" button to download that specific content
   - Use the "Download Full Report" button at the top to get a comprehensive PDF with all content

## API Documentation

When the backend is running, you can access the API documentation at http://localhost:8000/docs

## Database Management

The application uses SQLite for data storage, with the database file located in the `backend/data` directory. This makes it easy to backup, migrate, or inspect the database.

### Database Utility Script

The application includes a database utility script to help with maintenance tasks:

```bash
# Navigate to backend directory
cd backend

# Check database status
python db_utils.py --check

# Backup the database
python db_utils.py --backup

# Clean orphaned files (files without database records)
python db_utils.py --clean
```

### Data Directory Structure

- `backend/data/` - Contains the SQLite database file
- `backend/data/backups/` - Contains database backups (created when using the backup utility)
- `backend/uploads/` - Stores uploaded audio files
- `backend/pdfs/` - Stores generated PDF files

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Alibaba Cloud for providing ASR services
- Cohere AI for summarization and action item extraction
- FastAPI and React for the excellent frameworks 
