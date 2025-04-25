# Meeting Analyzer

A web application that analyzes meeting audio by transcribing, translating, summarizing, and extracting action items. Users can view and download the analyzed content as PDF files.

## Features

- **Audio Transcription**: Transcribe meeting audio using AssemblyAI
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
- Git

## Installation

### Clone the Repository

```bash
git clone https://github.com/CrazyPrash007/Meeting-Analyzer.git
cd Meeting-Analyzer
```

### Backend Setup

1. Create and activate a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

2. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create necessary directories (if they don't exist):
   ```bash
   mkdir -p data uploads pdfs
   ```

4. Set up environment variables:
   ```bash
   # Create a .env file in the backend directory
   touch .env
   ```
   
   Add the following to your `.env` file:
   ```
   # AssemblyAI API Key
   ASSEMBLY_AI_API_KEY=your_assembly_ai_api_key_here
   
   # Cohere API Key
   COHERE_API_KEY=your_cohere_api_key_here
   ```

### Frontend Setup

1. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Create a `.env` file in the frontend directory (optional):
   ```bash
   # Create .env file
   touch .env
   ```
   
   Add the following to your frontend `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```

## Running the Application

1. Start the backend server:
   ```bash
   # Make sure you're in the backend directory with virtual environment activated
   cd backend
   python -m uvicorn main:app --reload
   ```

2. Start the frontend development server (in a separate terminal):
   ```bash
   # Make sure you're in the frontend directory
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## API Documentation

When the backend is running, you can access the API documentation at http://localhost:8000/docs

## API Keys and Demo Mode

### Getting API Keys

The application requires API keys to function properly:

1. **AssemblyAI** for transcription
   - Create an account at [AssemblyAI](https://www.assemblyai.com/)
   - Get your API key from the dashboard

2. **Cohere AI** for text analysis
   - Create an account at [Cohere](https://cohere.ai/)
   - Get your API key from the dashboard

### Demo Mode

If you don't have API keys, you can run the application in "demo mode":

1. Create a `.env` file in the backend directory with placeholder values:
   ```
   ASSEMBLY_AI_API_KEY=demo_assembly_ai_api_key
   COHERE_API_KEY=demo_cohere_api_key
   ```

In demo mode:
- Transcription returns placeholder text instead of actual transcription
- AI analysis uses pre-defined examples
- PDF generation creates text files instead of proper PDFs

## Troubleshooting

### Common Issues

1. **Missing directories**:
   - Make sure `backend/data`, `backend/uploads`, and `backend/pdfs` directories exist
   - They should be created automatically, but you may need to create them manually

2. **Database errors**:
   - The application uses SQLite with the database file located in `backend/data`
   - If you encounter database errors, you can use the built-in utility:
     ```bash
     cd backend
     python db_utils.py --check
     ```

3. **Module not found errors**:
   - Make sure all dependencies are installed:
     ```bash
     # In backend directory
     pip install -r requirements.txt
     
     # In frontend directory
     npm install
     ```

4. **Port conflicts**:
   - If port 8000 or 3000 is already in use, you can change the ports:
     ```bash
     # For backend
     python -m uvicorn main:app --reload --port 8001
     
     # For frontend, modify package.json or set environment variables
     PORT=3001 npm start
     ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Alibaba Cloud for providing ASR services
- Cohere AI for summarization and action item extraction
- FastAPI and React for the excellent frameworks 
