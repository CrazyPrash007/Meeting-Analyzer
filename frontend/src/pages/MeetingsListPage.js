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
  Tooltip,
  Chip,
  Divider,
  Stack,
  useTheme,
  Avatar,
  Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import ArticleIcon from '@mui/icons-material/Article';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import LanguageIcon from '@mui/icons-material/Language';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PendingIcon from '@mui/icons-material/Pending';
import SpeakerNotesOffIcon from '@mui/icons-material/SpeakerNotesOff';
import TimerIcon from '@mui/icons-material/Timer';
import { formatDateWithTimezone, getTimeAgo } from '../utils/dateUtils';
import TimezoneSelector from '../components/TimezoneSelector';

const MeetingsListPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
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

  const getLanguageLabel = (code) => {
    const languages = {
      'en': 'English',
      'zh': 'Chinese (Mandarin)',
      'yue': 'Chinese (Cantonese)',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'ja': 'Japanese',
    };
    return languages[code] || code;
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

  const renderMeetingSkeletons = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ ml: 1, flexGrow: 1 }}>
                <Skeleton width="70%" height={24} />
              </Box>
            </Box>
            <Skeleton width="90%" height={20} sx={{ mb: 1 }} />
            <Skeleton width="60%" height={20} sx={{ mb: 1 }} />
            <Skeleton width="80%" height={20} sx={{ mb: 1 }} />
          </CardContent>
          <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Skeleton width={120} height={36} />
          </CardActions>
        </Card>
      </Grid>
    ));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{
              fontWeight: 'bold',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            My Meetings
          </Typography>
          <TimezoneSelector compact showIcon={false} />
        </Box>
        
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, md: 4 }, 
            mb: 4, 
            mt: 2,
            borderRadius: 3,
            background: `linear-gradient(120deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            gap: 2
          }}>
            <Box>
              <Typography variant="body1" color="text.secondary">
                View, manage and analyze your meeting recordings
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<CloudUploadIcon />}
              onClick={() => navigate('/upload')}
              sx={{ 
                py: 1.2, 
                px: 3, 
                fontWeight: 500,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            >
              Upload New
            </Button>
          </Box>
        </Paper>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
            }}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Grid container spacing={3}>
            {renderMeetingSkeletons()}
          </Grid>
        ) : meetings.length > 0 ? (
          <Grid container spacing={3}>
            {meetings.map((meeting) => (
              <Grid item xs={12} sm={6} md={4} key={meeting.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 3,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    overflow: 'visible',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0px 12px 28px rgba(0, 0, 0, 0.1)',
                      '& .hover-button': {
                        opacity: 1,
                        transform: 'translateY(0)'
                      }
                    }
                  }}
                  onClick={() => navigate(`/meetings/${meeting.id}`)}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: -12,
                      right: 16,
                      zIndex: 1
                    }}
                  >
                    <Tooltip title="Delete meeting">
                      <IconButton 
                        size="small" 
                        color="error" 
                        sx={{ 
                          bgcolor: 'white',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          border: '1px solid',
                          borderColor: 'grey.200',
                          '&:hover': {
                            bgcolor: 'error.light',
                            color: 'white'
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(meeting);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: meeting.transcription 
                            ? 'success.light'
                            : 'warning.light',
                          width: 48,
                          height: 48
                        }}
                      >
                        {meeting.transcription 
                          ? <ArticleIcon />
                          : <PendingIcon />
                        }
                      </Avatar>
                      <Box sx={{ ml: 2 }}>
                        <Chip 
                          size="small" 
                          label={meeting.transcription ? "Transcribed" : "Processing"} 
                          color={meeting.transcription ? "success" : "warning"}
                          icon={meeting.transcription ? <CheckCircleOutlineIcon /> : <PendingIcon />}
                        />
                      </Box>
                    </Box>
                    
                    <Typography 
                      variant="h6" 
                      component="h2" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600,
                        lineHeight: 1.3,
                        height: 48,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {meeting.title}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EventIcon sx={{ color: 'text.secondary', fontSize: 18, mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDateWithTimezone(meeting.date)}
                        </Typography>
                      </Box>
                      
                      {meeting.date && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: 'block' }}>
                          {getTimeAgo(meeting.date)}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LanguageIcon sx={{ color: 'text.secondary', fontSize: 18, mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {meeting.detected_language 
                            ? getLanguageLabel(meeting.detected_language) 
                            : meeting.language 
                              ? getLanguageLabel(meeting.language)
                              : 'Language detecting...'}
                        </Typography>
                      </Box>
                      {meeting.audio_duration && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TimerIcon sx={{ color: 'text.secondary', fontSize: 18, mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Duration: {meeting.audio_duration}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'center', p: 2, pt: 0 }}>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      sx={{ 
                        borderRadius: 2,
                        opacity: 0.9,
                        transition: 'all 0.3s',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.main',
                          color: 'white',
                          opacity: 1
                        }
                      }}
                      className="hover-button"
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 6, 
              textAlign: 'center',
              borderRadius: 4,
              border: '2px dashed',
              borderColor: 'grey.300',
              bgcolor: 'grey.50',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            <SpeakerNotesOffIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="text.secondary" fontWeight={500}>
              No Meetings Found
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary" sx={{ mb: 4 }}>
              You don't have any meetings yet. Upload an audio recording to get started with 
              transcription, summarization, and analysis.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              startIcon={<CloudUploadIcon />}
              onClick={() => navigate('/upload')}
              sx={{ 
                py: 1.5, 
                px: 4,
                borderRadius: 2,
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)'
              }}
            >
              Upload Your First Meeting
            </Button>
          </Paper>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>Delete Meeting</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary' }}>
            Are you sure you want to delete <strong>"{meetingToDelete?.title}"</strong>?
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, color: 'error.main' }}>
            This action cannot be undone. All transcriptions, translations, and generated PDFs 
            will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleDeleteCancel} 
            disabled={deleteLoading}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
            sx={{ borderRadius: 2 }}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MeetingsListPage; 