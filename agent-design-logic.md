# Meeting Analyzer: Agent Design Logic

## Core Architecture
- **Two-Tier System**: Frontend (React/Material-UI) + Backend (FastAPI/SQLite)
- **API Integration**: AssemblyAI (transcription) and Cohere AI (analysis)

## Workflow Pipeline
1. **Audio Upload & Processing**: User uploads audio → temporary storage → AssemblyAI API processing
2. **Text Analysis**: Transcribed text → Cohere AI for:
   - Summarization of key points
   - Action item extraction with assignee detection
   - Language translation (when requested)
3. **Data Persistence**: Results stored in SQLite database with file references
4. **Output Generation**: PDF generation using ReportLab for document export

## Agent Communication Flow
```
User → Frontend → Backend → AI Services → Backend → Frontend → User
```

## Technical Components
- **Service Orchestration**: Asynchronous processing with status updates
- **Error Handling**: Fallback to demo mode when API services unavailable
- **Modular Design**: Separate services for transcription, analysis, and export

## Performance Considerations
- Parallel processing for independent operations
- Caching of intermediate results to avoid redundant API calls
- Stateless API design for horizontal scalability

## Security & Privacy
- API keys stored in environment variables (not in codebase)
- Temporary storage for sensitive audio files
- Data segregation between users
- Optional data retention policies

## Extension Points
- Additional AI models can be integrated via service adapters
- Multiple language support through translation services
- Custom PDF templates for different organization needs 