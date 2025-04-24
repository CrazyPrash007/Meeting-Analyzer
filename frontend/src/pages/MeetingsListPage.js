import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Button, 
  Box, 
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import ArticleIcon from '@mui/icons-material/Article';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

const MeetingsListPage = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const data = await apiService.getMeetings();
        setMeetings(data);
        setError('');
      } catch (error) {
        console.error('Error fetching meetings:', error);
        setError('Failed to load meetings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDeleteClick = (meeting) => {
    setMeetingToDelete(meeting);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!meetingToDelete) return;
    
    try {
      setDeleteLoading(true);
      await apiService.deleteMeeting(meetingToDelete.id);
      // Remove meeting from state
      setMeetings(meetings.filter(m => m.id !== meetingToDelete.id));
      setDeleteDialogOpen(false);
      setMeetingToDelete(null);
    } catch (error) {
      console.error('Error deleting meeting:', error);
      setError('Failed to delete meeting. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setMeetingToDelete(null);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 3 }}>
        <Typography variant="h4" component="h1">
          Your Meetings
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<CloudUploadIcon />}
          onClick={() => navigate('/upload')}
        >
          Upload New
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : meetings.length > 0 ? (
        <Grid container spacing={3}>
          {meetings.map((meeting) => (
            <Grid item xs={12} sm={6} md={4} key={meeting.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <ArticleIcon color="primary" fontSize="large" />
                    <Tooltip title="Delete meeting">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(meeting);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="h6" component="h2" align="center" gutterBottom noWrap>
                    {meeting.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {meeting.date ? formatDate(meeting.date) : 'Date not available'}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Status:</strong> {
                        meeting.transcription ? 'Transcribed' : 'Processing...'
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Language:</strong> {
                        meeting.language === 'en' ? 'English' :
                        meeting.language === 'zh' ? 'Chinese (Mandarin)' :
                        meeting.language === 'yue' ? 'Chinese (Cantonese)' :
                        meeting.language === 'es' ? 'Spanish' :
                        meeting.language === 'fr' ? 'French' :
                        meeting.language === 'de' ? 'German' :
                        meeting.language === 'ja' ? 'Japanese' :
                        meeting.language
                      }
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => navigate(`/meetings/${meeting.id}`)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" paragraph>
            You don't have any meetings yet.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<CloudUploadIcon />}
            onClick={() => navigate('/upload')}
          >
            Upload Your First Meeting
          </Button>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Meeting</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{meetingToDelete?.title}"? This action cannot be undone.
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

export default MeetingsListPage; 