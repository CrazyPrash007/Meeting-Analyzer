import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Button, 
  Box, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import DownloadIcon from '@mui/icons-material/Download';
import TranslateIcon from '@mui/icons-material/Translate';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SummarizeIcon from '@mui/icons-material/Summarize';
import ArticleIcon from '@mui/icons-material/Article';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import DeleteIcon from '@mui/icons-material/Delete';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MeetingDetailPage = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('zh');
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch meeting data
  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const data = await apiService.getMeeting(meetingId);
        setMeeting(data);
        
        // If transcription isn't ready yet, set up polling
        if (!data.transcription) {
          // Only set up polling if we haven't already
          if (!refreshInterval) {
            const interval = setInterval(() => {
              setRefreshCount(prev => prev + 1);
            }, 5000); // Poll every 5 seconds
            setRefreshInterval(interval);
          }
        } else {
          // Clear polling if transcription is ready
          if (refreshInterval) {
            clearInterval(refreshInterval);
            setRefreshInterval(null);
          }
        }
        
        setError('');
      } catch (error) {
        console.error('Error fetching meeting:', error);
        setError('Failed to load meeting details. Please try again later.');
        
        // Clear polling on error
        if (refreshInterval) {
          clearInterval(refreshInterval);
          setRefreshInterval(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
    
    // Clean up interval on component unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [meetingId, refreshCount, refreshInterval]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle translation
  const handleTranslate = async () => {
    try {
      setTranslationLoading(true);
      await apiService.translateMeeting(meetingId, targetLanguage);
      
      // Refresh meeting data to get translation
      const updatedMeeting = await apiService.getMeeting(meetingId);
      setMeeting(updatedMeeting);
      
      // Switch to translation tab
      setTabValue(1);
    } catch (error) {
      console.error('Translation error:', error);
      setError('Failed to translate meeting. Please try again later.');
    } finally {
      setTranslationLoading(false);
    }
  };

  // Download PDF
  const handleDownloadPdf = (pdfType) => {
    window.open(apiService.getPdfUrl(meetingId, pdfType), '_blank');
  };

  // Handle delete
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      await apiService.deleteMeeting(meetingId);
      // Navigate back to meetings list
      navigate('/meetings', { replace: true });
    } catch (error) {
      console.error('Error deleting meeting:', error);
      setError('Failed to delete meeting. Please try again.');
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  // Format action items for display
  const formatActionItems = (actionItems) => {
    if (!actionItems) return [];
    
    return actionItems.split('\n')
      .filter(item => item.trim() !== '')
      .map((item, index) => item.trim());
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<KeyboardBackspaceIcon />}
          onClick={() => navigate('/meetings')}
        >
          Back to Meetings
        </Button>
      </Container>
    );
  }

  if (!meeting) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Meeting not found
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<KeyboardBackspaceIcon />}
          onClick={() => navigate('/meetings')}
          sx={{ mt: 3 }}
        >
          Back to Meetings
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header with meeting title and back button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Button 
            variant="text" 
            startIcon={<KeyboardBackspaceIcon />}
            onClick={() => navigate('/meetings')}
            sx={{ mb: 1 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            {meeting.title}
          </Typography>
        </Box>
        <Box>
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
            sx={{ mr: 2 }}
          >
            Delete
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PictureAsPdfIcon />}
            onClick={() => handleDownloadPdf('report')}
            disabled={!meeting.transcription || !meeting.summary}
          >
            Download Full Report
          </Button>
        </Box>
      </Box>

      {/* Process status */}
      {!meeting.transcription && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Your meeting audio is still being processed. This page will automatically update when ready.
        </Alert>
      )}

      {/* Main content tabs */}
      <Paper elevation={3} sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="meeting details tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<ArticleIcon />} iconPosition="start" label="Transcription" disabled={!meeting.transcription} />
            <Tab icon={<TranslateIcon />} iconPosition="start" label="Translation" disabled={!meeting.translation} />
            <Tab icon={<SummarizeIcon />} iconPosition="start" label="Summary" disabled={!meeting.summary} />
            <Tab icon={<AssignmentIcon />} iconPosition="start" label="Action Items" disabled={!meeting.action_items} />
          </Tabs>
        </Box>

        {/* Transcription tab */}
        <TabPanel value={tabValue} index={0}>
          {meeting.transcription ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Transcription
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownloadPdf('transcript')}
                >
                  Download PDF
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
                {meeting.transcription}
              </Box>
              
              {/* Translation options */}
              <Paper sx={{ p: 3, mt: 4, backgroundColor: '#f8f9fa' }}>
                <Typography variant="h6" gutterBottom>
                  Translate Transcription
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <FormControl sx={{ minWidth: 150, mr: 2 }}>
                    <InputLabel id="target-language-label">Target Language</InputLabel>
                    <Select
                      labelId="target-language-label"
                      id="target-language"
                      value={targetLanguage}
                      label="Target Language"
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      disabled={translationLoading}
                    >
                      <MenuItem value="zh">Chinese (Mandarin)</MenuItem>
                      <MenuItem value="yue">Chinese (Cantonese)</MenuItem>
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="es">Spanish</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                      <MenuItem value="de">German</MenuItem>
                      <MenuItem value="ja">Japanese</MenuItem>
                    </Select>
                  </FormControl>
                  <Button 
                    variant="contained" 
                    onClick={handleTranslate}
                    disabled={translationLoading}
                    startIcon={translationLoading ? <CircularProgress size={20} /> : <TranslateIcon />}
                  >
                    {translationLoading ? 'Translating...' : 'Translate'}
                  </Button>
                </Box>
              </Paper>
            </>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
              <CircularProgress size={40} sx={{ mb: 3 }} />
              <Typography variant="h6" gutterBottom>
                Processing Transcription
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Your meeting audio is being transcribed. This may take a few minutes depending on the length of the audio.
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Translation tab */}
        <TabPanel value={tabValue} index={1}>
          {meeting.translation ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Translation
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownloadPdf('transcript')}
                >
                  Download PDF
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ whiteSpace: 'pre-wrap' }}>
                {meeting.translation}
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
              <Typography variant="h6" gutterBottom>
                No Translation Available
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                Use the translate button in the Transcription tab to generate a translation.
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => setTabValue(0)}
                startIcon={<TranslateIcon />}
              >
                Go to Transcription
              </Button>
            </Box>
          )}
        </TabPanel>

        {/* Summary tab */}
        <TabPanel value={tabValue} index={2}>
          {meeting.summary ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Meeting Summary
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownloadPdf('summary')}
                >
                  Download PDF
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ whiteSpace: 'pre-wrap' }}>
                {meeting.summary}
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
              <CircularProgress size={40} sx={{ mb: 3 }} />
              <Typography variant="h6" gutterBottom>
                Generating Summary
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                We're analyzing your meeting to create a concise summary. This may take a few minutes.
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Action Items tab */}
        <TabPanel value={tabValue} index={3}>
          {meeting.action_items ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Action Items
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownloadPdf('summary')}
                >
                  Download PDF
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                {formatActionItems(meeting.action_items).map((item, index) => (
                  <Grid item xs={12} key={index}>
                    <Card variant="outlined" sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <Chip 
                            label={`#${index + 1}`}
                            size="small"
                            color="primary"
                            sx={{ mr: 2, mt: 0.5 }}
                          />
                          <Typography variant="body1">{item}</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {formatActionItems(meeting.action_items).length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body1" color="text.secondary" align="center">
                      No action items were identified in this meeting.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
              <CircularProgress size={40} sx={{ mb: 3 }} />
              <Typography variant="h6" gutterBottom>
                Extracting Action Items
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                We're analyzing your meeting to identify action items and assignments. This may take a few minutes.
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Meeting</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{meeting.title}"? This action cannot be undone.
            All transcriptions, translations, and generated PDFs will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MeetingDetailPage; 