import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Alert, 
  CircularProgress 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const UploadPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('en');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Check file type (audio only)
      if (!selectedFile.type.includes('audio')) {
        setError('Please upload an audio file (MP3, WAV, etc.)');
        setFile(null);
        setFileName('');
        return;
      }
      
      // Check file size (limit to 100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError('File size too large. Please upload a file smaller than 100MB.');
        setFile(null);
        setFileName('');
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError('');
    }
  };

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
      formData.append('language', language);
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
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Upload Meeting Audio
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Audio uploaded successfully! Redirecting to analysis page...
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
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="language-label">Audio Language</InputLabel>
            <Select
              labelId="language-label"
              id="language"
              value={language}
              label="Audio Language"
              onChange={(e) => setLanguage(e.target.value)}
              disabled={loading || success}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="zh">Chinese (Mandarin)</MenuItem>
              <MenuItem value="yue">Chinese (Cantonese)</MenuItem>
              <MenuItem value="es">Spanish</MenuItem>
              <MenuItem value="fr">French</MenuItem>
              <MenuItem value="de">German</MenuItem>
              <MenuItem value="ja">Japanese</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ mt: 3, mb: 3 }}>
            <input
              accept="audio/*"
              style={{ display: 'none' }}
              id="audio-file"
              type="file"
              onChange={handleFileChange}
              disabled={loading || success}
            />
            <label htmlFor="audio-file">
              <Button
                component="span"
                fullWidth
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ py: 1.5 }}
                disabled={loading || success}
              >
                {fileName ? fileName : 'Select Audio File'}
              </Button>
            </label>
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || success || !file}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload & Analyze'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UploadPage; 