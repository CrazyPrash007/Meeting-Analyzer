import React, { useState, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  Box, 
  Alert, 
  CircularProgress,
  Card,
  CardContent,
  useTheme,
  Grid,
  Chip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import MicNoneIcon from '@mui/icons-material/MicNone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import EventIcon from '@mui/icons-material/Event';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { useDropzone } from 'react-dropzone';

const UploadPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      // Check file type (audio only)
      if (!selectedFile.type.includes('audio')) {
        setError('Please upload an audio file (MP3, WAV, etc.)');
        setFile(null);
        setFileName('');
        setFileInfo(null);
        return;
      }
      
      // Check file size (limit to 100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError('File size too large. Please upload a file smaller than 100MB.');
        setFile(null);
        setFileName('');
        setFileInfo(null);
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
      
      // Set file info for display
      const sizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
      setFileInfo({
        name: selectedFile.name,
        type: selectedFile.type,
        size: `${sizeMB} MB`,
        lastModified: new Date(selectedFile.lastModified).toLocaleString()
      });
      
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac']
    },
    maxFiles: 1,
    disabled: loading || success
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!file) {
      setError('Please select an audio file to upload');
      return;
    }
    
    if (!title.trim()) {
      setError('Please enter a meeting title');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Create form data for upload
      const formData = new FormData();
      formData.append('title', title);
      formData.append('audio_file', file);
      
      // Upload the file
      const response = await apiService.uploadMeetingAudio(formData);
      
      setSuccess(true);
      setLoading(false);
      
      // Redirect to meeting detail page after 2 seconds
      setTimeout(() => {
        navigate(`/meetings/${response.id}`);
      }, 2000);
      
    } catch (error) {
      setLoading(false);
      console.error('Upload error:', error);
      setError(error.response?.data?.detail || 'Error uploading file. Please try again.');
    }
  };

  return (
    <Container maxWidth="md">
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          mt: 4, 
          mb: 4,
          borderRadius: 3 
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            fontWeight="bold"
            sx={{
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'inline-block'
            }}
          >
            Upload Meeting Audio
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            Upload your meeting recording to automatically transcribe, summarize, and extract action items.
          </Typography>
        </Box>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              borderRadius: 2,
              '& .MuiAlert-icon': { alignItems: 'center' }
            }}
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 4, 
              borderRadius: 2,
              '& .MuiAlert-icon': { alignItems: 'center' }
            }}
            icon={<CheckCircleIcon />}
          >
            <Typography variant="body1" fontWeight={500}>
              Audio uploaded successfully!
            </Typography>
            <Typography variant="body2">
              Redirecting to analysis page... Audio language will be automatically detected during processing.
            </Typography>
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Meeting Title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading || success}
            sx={{ 
              mb: 4,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          
          <Box 
            {...getRootProps()} 
            sx={{ 
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 3,
              mb: 3,
              textAlign: 'center',
              cursor: loading || success ? 'default' : 'pointer',
              backgroundColor: isDragActive ? `${theme.palette.primary.light}20` : 'background.paper',
              transition: 'all 0.2s ease',
              opacity: loading || success ? 0.7 : 1,
              '&:hover': {
                borderColor: !loading && !success ? 'primary.main' : 'grey.300',
                backgroundColor: !loading && !success ? `${theme.palette.primary.light}15` : 'background.paper',
                boxShadow: !loading && !success ? '0px 4px 12px rgba(0, 0, 0, 0.08)' : 'none',
              }
            }}
          >
            <input {...getInputProps()} />
            <MicNoneIcon 
              sx={{ 
                fontSize: 48, 
                color: isDragActive ? 'primary.dark' : 'primary.main', 
                mb: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }} 
            />
            <Typography 
              variant="h6" 
              gutterBottom 
              color={isDragActive ? 'primary.dark' : 'text.primary'}
              sx={{ transition: 'color 0.2s ease' }}
            >
              {isDragActive ? 'Drop the audio file here' : 'Drag & drop your audio file here'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or {!loading && !success && <span style={{ color: theme.palette.primary.main, fontWeight: 500 }}>browse files</span>}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Supports MP3, WAV, M4A, AAC, FLAC (max 100MB)
            </Typography>
            {fileName && (
              <Chip 
                icon={<AudioFileIcon />} 
                label={fileName} 
                color="primary" 
                variant="outlined"
                sx={{ mt: 2 }}
              />
            )}
          </Box>
          
          {/* File Info Card */}
          {fileInfo && (
            <Card 
              variant="outlined" 
              sx={{ 
                mb: 4,
                borderRadius: 2,
                borderColor: 'primary.light',
                backgroundColor: 'background.paper',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                  Audio File Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <AudioFileIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.primary" fontWeight={500}>
                        File Name:
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      {fileInfo.name}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <InsertDriveFileIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.primary" fontWeight={500}>
                        File Size:
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      {fileInfo.size}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <AudioFileIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.primary" fontWeight={500}>
                        File Type:
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      {fileInfo.type}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.primary" fontWeight={500}>
                        Last Modified:
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      {fileInfo.lastModified}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || success || !file}
            sx={{ 
              mt: 2, 
              mb: 2, 
              py: 1.5,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              <>
                <CloudUploadIcon sx={{ mr: 1 }} />
                {success ? 'Uploaded Successfully' : 'Upload & Analyze'}
              </>
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UploadPage; 