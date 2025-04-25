import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  DialogTitle,
  TextField,
  IconButton,
  InputAdornment,
  Tooltip,
  Zoom
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
import EventIcon from '@mui/icons-material/Event';
import TimerIcon from '@mui/icons-material/Timer';
import LanguageIcon from '@mui/icons-material/Language';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { toast } from 'react-hot-toast';
import { formatDateWithTimezone, getTimeAgo } from '../utils/dateUtils';
import TimezoneSelector from '../components/TimezoneSelector';

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

// Add this function to parse JSON data
const parseAudioInfo = (audioInfoStr) => {
  if (!audioInfoStr) return null;
  
  try {
    return typeof audioInfoStr === 'object' ? audioInfoStr : JSON.parse(audioInfoStr);
  } catch (e) {
    console.error('Error parsing audio info:', e);
    return null;
  }
};

// Update the AudioInfoCard component to use the new timezone selector
const AudioInfoCard = ({ audioInfoStr, meeting }) => {
  const audioInfo = parseAudioInfo(audioInfoStr);
  
  if (!audioInfo && !meeting) return null;
  
  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" gutterBottom>
            Meeting Information
          </Typography>
          <TimezoneSelector compact />
        </Box>
        <Grid container spacing={2}>
          {/* Recording Date */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.primary" fontWeight={500}>
                Recording Date:
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              {formatDateWithTimezone(meeting?.date)}
            </Typography>
            {meeting?.date && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: 'block' }}>
                {getTimeAgo(meeting.date)}
              </Typography>
            )}
          </Grid>

          {/* Language Information */}
          {(meeting?.detected_language || audioInfo?.detected_language) && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LanguageIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.primary" fontWeight={500}>
                  Detected Language:
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                {meeting?.detected_language || audioInfo?.detected_language || "Not detected"}
              </Typography>
            </Grid>
          )}
          
          {/* Audio Duration */}
          {(meeting?.audio_duration || audioInfo?.audio_duration) && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimerIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.primary" fontWeight={500}>
                  Duration:
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                {meeting?.audio_duration || audioInfo?.audio_duration}
              </Typography>
            </Grid>
          )}
          
          {/* Audio Format */}
          {audioInfo?.audio_format && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.primary" fontWeight={500}>
                  Format:
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                {audioInfo.audio_format}
              </Typography>
            </Grid>
          )}
          
          {/* File Size */}
          {audioInfo?.file_size_mb && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.primary" fontWeight={500}>
                  File Size:
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                {audioInfo.file_size_mb} MB
              </Typography>
            </Grid>
          )}
        </Grid>
        
        {/* Speaker Information */}
        {audioInfo?.speakers && audioInfo.speakers.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }} color="text.primary" fontWeight={500}>
              Speakers:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {audioInfo.speakers.map((speaker, index) => (
                <Chip 
                  key={index} 
                  label={speaker} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

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
  const [isLoading, setIsLoading] = useState(false);
  // Add state for search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const [showSearch, setShowSearch] = useState(false);
  const transcriptionRef = useRef(null);
  // Add state for translation search functionality
  const [translationSearchTerm, setTranslationSearchTerm] = useState('');
  const [translationSearchResults, setTranslationSearchResults] = useState([]);
  const [currentTranslationResultIndex, setCurrentTranslationResultIndex] = useState(-1);
  const [showTranslationSearch, setShowTranslationSearch] = useState(false);
  const translationRef = useRef(null);
  // Add state for summary search functionality
  const [summarySearchTerm, setSummarySearchTerm] = useState('');
  const [summarySearchResults, setSummarySearchResults] = useState([]);
  const [currentSummaryResultIndex, setCurrentSummaryResultIndex] = useState(-1);
  const [showSummarySearch, setShowSummarySearch] = useState(false);
  const summaryRef = useRef(null);
  // State to control the pulsing animation of search icons
  const [showPulseAnimation, setShowPulseAnimation] = useState(true);
  // State to control the search tooltip
  const [showTooltip, setShowTooltip] = useState(false);

  // Disable the pulsing animation after component mounts and delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPulseAnimation(false);
    }, 3000); // Disable after 3 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  // Create animation keyframes CSS
  const pulseAnimation = {
    '@keyframes pulse': {
      '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.4)' },
      '70%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)' },
      '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)' },
    },
    animation: showPulseAnimation ? 'pulse 1.5s infinite' : 'none',
  };

  // Show tooltip after a delay
  useEffect(() => {
    if (meeting?.transcription) {
      const tooltipTimer = setTimeout(() => {
        setShowTooltip(true);
      }, 1000);
      
      // Hide tooltip after some time
      const hideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 8000);
      
      return () => {
        clearTimeout(tooltipTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [meeting?.transcription]);

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
  const handleDownloadPdf = async (pdfType) => {
    setIsLoading(true);
    try {
      const result = await apiService.downloadPdf(meetingId, pdfType, meeting);
      if (result.format === 'text') {
        toast.info('PDF conversion failed. Downloaded as text file instead.', {
          position: "bottom-right",
          autoClose: 5000
        });
      } else {
        toast.success(`${pdfType.charAt(0).toUpperCase() + pdfType.slice(1)} downloaded successfully!`, {
          position: "bottom-right",
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error(`Error downloading ${pdfType}:`, error);
      toast.error(`Failed to download ${pdfType}. ${error.message}`, {
        position: "bottom-right",
        autoClose: 5000
      });
    } finally {
      setIsLoading(false);
    }
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

  // Function to handle search
  const handleSearch = () => {
    if (!searchTerm.trim() || !meeting?.transcription) {
      setSearchResults([]);
      setCurrentResultIndex(-1);
      return;
    }

    const term = searchTerm.toLowerCase();
    const text = meeting.transcription.toLowerCase();
    const results = [];
    
    let position = text.indexOf(term);
    while (position !== -1) {
      results.push(position);
      position = text.indexOf(term, position + 1);
    }
    
    setSearchResults(results);
    setCurrentResultIndex(results.length > 0 ? 0 : -1);
    
    // Scroll to the first result or show "no results" toast
    if (results.length > 0) {
      scrollToResult(0);
    } else {
      toast.info(`No matches found for "${searchTerm}"`, {
        position: "bottom-right",
        autoClose: 3000
      });
    }
  };

  // Define scroll functions first with useRef dependencies
  const scrollToResult = useCallback((index) => {
    if (!transcriptionRef.current || searchResults.length === 0) return;
    
    const transcriptionElement = transcriptionRef.current;
    const result = searchResults[index];
    
    // Create a temporary element to calculate correct position
    const tempElement = document.createElement('div');
    tempElement.style.visibility = 'hidden';
    tempElement.style.position = 'absolute';
    tempElement.innerHTML = meeting?.transcription?.substring(0, result) || '';
    document.body.appendChild(tempElement);
    
    const height = tempElement.offsetHeight;
    document.body.removeChild(tempElement);
    
    // Scroll to the position
    transcriptionElement.scrollTop = height - 100; // Offset to center the result
  }, [transcriptionRef, searchResults, meeting]);

  // Function to scroll to a specific translation search result
  const scrollToTranslationResult = useCallback((index) => {
    if (!translationRef.current || translationSearchResults.length === 0) return;
    
    const translationElement = translationRef.current;
    const result = translationSearchResults[index];
    
    // Create a temporary element to calculate correct position
    const tempElement = document.createElement('div');
    tempElement.style.visibility = 'hidden';
    tempElement.style.position = 'absolute';
    tempElement.innerHTML = meeting?.translation?.substring(0, result) || '';
    document.body.appendChild(tempElement);
    
    const height = tempElement.offsetHeight;
    document.body.removeChild(tempElement);
    
    // Scroll to the position
    translationElement.scrollTop = height - 100; // Offset to center the result
  }, [translationRef, translationSearchResults, meeting]);

  // Function to scroll to a specific summary search result
  const scrollToSummaryResult = useCallback((index) => {
    if (!summaryRef.current || summarySearchResults.length === 0) return;
    
    const summaryElement = summaryRef.current;
    const result = summarySearchResults[index];
    
    // Create a temporary element to calculate correct position
    const tempElement = document.createElement('div');
    tempElement.style.visibility = 'hidden';
    tempElement.style.position = 'absolute';
    tempElement.innerHTML = meeting?.summary?.substring(0, result) || '';
    document.body.appendChild(tempElement);
    
    const height = tempElement.offsetHeight;
    document.body.removeChild(tempElement);
    
    // Scroll to the position
    summaryElement.scrollTop = height - 100; // Offset to center the result
  }, [summaryRef, summarySearchResults, meeting]);

  // Function to navigate between search results
  const navigateResults = useCallback((direction) => {
    if (searchResults.length === 0) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentResultIndex + 1) % searchResults.length;
    } else {
      newIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
    }
    
    setCurrentResultIndex(newIndex);
    scrollToResult(newIndex);
  }, [searchResults, currentResultIndex, scrollToResult]);

  // Function to navigate between translation search results
  const navigateTranslationResults = useCallback((direction) => {
    if (translationSearchResults.length === 0) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentTranslationResultIndex + 1) % translationSearchResults.length;
    } else {
      newIndex = (currentTranslationResultIndex - 1 + translationSearchResults.length) % translationSearchResults.length;
    }
    
    setCurrentTranslationResultIndex(newIndex);
    scrollToTranslationResult(newIndex);
  }, [translationSearchResults, currentTranslationResultIndex, scrollToTranslationResult]);

  // Function to navigate between summary search results
  const navigateSummaryResults = useCallback((direction) => {
    if (summarySearchResults.length === 0) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentSummaryResultIndex + 1) % summarySearchResults.length;
    } else {
      newIndex = (currentSummaryResultIndex - 1 + summarySearchResults.length) % summarySearchResults.length;
    }
    
    setCurrentSummaryResultIndex(newIndex);
    scrollToSummaryResult(newIndex);
  }, [summarySearchResults, currentSummaryResultIndex, scrollToSummaryResult]);

  // Function to highlight search results in text
  const highlightSearchResults = (text) => {
    if (!searchTerm.trim() || !text) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    
    return parts.map((part, i) => {
      // Check if this part matches the search term (case insensitive)
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        return (
          <mark 
            key={i} 
            style={{ 
              backgroundColor: '#FFEB3B', 
              padding: '0 0', 
              borderRadius: '2px',
              fontWeight: 'bold'
            }}
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  // Function to handle translation search
  const handleTranslationSearch = () => {
    if (!translationSearchTerm.trim() || !meeting?.translation) {
      setTranslationSearchResults([]);
      setCurrentTranslationResultIndex(-1);
      return;
    }

    const term = translationSearchTerm.toLowerCase();
    const text = meeting.translation.toLowerCase();
    const results = [];
    
    let position = text.indexOf(term);
    while (position !== -1) {
      results.push(position);
      position = text.indexOf(term, position + 1);
    }
    
    setTranslationSearchResults(results);
    setCurrentTranslationResultIndex(results.length > 0 ? 0 : -1);
    
    // Scroll to the first result or show "no results" toast
    if (results.length > 0) {
      scrollToTranslationResult(0);
    } else {
      toast.info(`No matches found for "${translationSearchTerm}"`, {
        position: "bottom-right",
        autoClose: 3000
      });
    }
  };

  // Function to highlight translation search results in text
  const highlightTranslationSearchResults = (text) => {
    if (!translationSearchTerm.trim() || !text) return text;
    
    const parts = text.split(new RegExp(`(${translationSearchTerm})`, 'gi'));
    
    return parts.map((part, i) => {
      // Check if this part matches the search term (case insensitive)
      if (part.toLowerCase() === translationSearchTerm.toLowerCase()) {
        return (
          <mark 
            key={i} 
            style={{ 
              backgroundColor: '#FFEB3B', 
              padding: '0 0', 
              borderRadius: '2px',
              fontWeight: 'bold'
            }}
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  // Function to handle summary search
  const handleSummarySearch = () => {
    if (!summarySearchTerm.trim() || !meeting?.summary) {
      setSummarySearchResults([]);
      setCurrentSummaryResultIndex(-1);
      return;
    }

    const term = summarySearchTerm.toLowerCase();
    const text = meeting.summary.toLowerCase();
    const results = [];
    
    let position = text.indexOf(term);
    while (position !== -1) {
      results.push(position);
      position = text.indexOf(term, position + 1);
    }
    
    setSummarySearchResults(results);
    setCurrentSummaryResultIndex(results.length > 0 ? 0 : -1);
    
    // Scroll to the first result or show "no results" toast
    if (results.length > 0) {
      scrollToSummaryResult(0);
    } else {
      toast.info(`No matches found for "${summarySearchTerm}"`, {
        position: "bottom-right",
        autoClose: 3000
      });
    }
  };

  // Function to highlight summary search results in text
  const highlightSummarySearchResults = (text) => {
    if (!summarySearchTerm.trim() || !text) return text;
    
    const parts = text.split(new RegExp(`(${summarySearchTerm})`, 'gi'));
    
    return parts.map((part, i) => {
      // Check if this part matches the search term (case insensitive)
      if (part.toLowerCase() === summarySearchTerm.toLowerCase()) {
        return (
          <mark 
            key={i} 
            style={{ 
              backgroundColor: '#FFEB3B', 
              padding: '0 0', 
              borderRadius: '2px',
              fontWeight: 'bold'
            }}
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  // Add keyboard shortcut handling
  const handleKeyboardShortcuts = useCallback((event) => {
    // Check if we're in an input field or textarea
    const isInput = event.target.tagName === 'INPUT' || 
                    event.target.tagName === 'TEXTAREA' || 
                    event.target.isContentEditable;
    
    // Get the active tab
    const activeTab = tabValue;
    
    // Ctrl+F or Cmd+F to toggle search (prevent default browser search)
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      event.preventDefault();
      
      // Toggle the appropriate search bar based on active tab
      if (activeTab === 0 && meeting?.transcription) {
        setShowSearch(prev => !prev);
      } else if (activeTab === 1 && meeting?.translation) {
        setShowTranslationSearch(prev => !prev);
      } else if (activeTab === 2 && meeting?.summary) {
        setShowSummarySearch(prev => !prev);
      }
    }
    
    // No further shortcuts if we're in an input field
    if (isInput) return;
    
    // Ctrl+G or F3 for next result
    if (((event.ctrlKey || event.metaKey) && event.key === 'g') || event.key === 'F3') {
      event.preventDefault();
      
      // Navigate to next result based on active tab
      if (activeTab === 0 && searchResults.length > 0) {
        navigateResults('next');
      } else if (activeTab === 1 && translationSearchResults.length > 0) {
        navigateTranslationResults('next');
      } else if (activeTab === 2 && summarySearchResults.length > 0) {
        navigateSummaryResults('next');
      }
    }
    
    // Shift+Ctrl+G or Shift+F3 for previous result
    if (((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'g') || 
        (event.shiftKey && event.key === 'F3')) {
      event.preventDefault();
      
      // Navigate to previous result based on active tab
      if (activeTab === 0 && searchResults.length > 0) {
        navigateResults('prev');
      } else if (activeTab === 1 && translationSearchResults.length > 0) {
        navigateTranslationResults('prev');
      } else if (activeTab === 2 && summarySearchResults.length > 0) {
        navigateSummaryResults('prev');
      }
    }
  }, [
    tabValue, 
    meeting, 
    searchResults, 
    translationSearchResults, 
    summarySearchResults,
    navigateResults,
    navigateTranslationResults,
    navigateSummaryResults,
    setShowSearch,
    setShowTranslationSearch,
    setShowSummarySearch
  ]);

  // Set up keyboard shortcut listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcuts);
    };
  }, [handleKeyboardShortcuts]);

  // Update search UI to include keyboard shortcut hint
  const renderSearchShortcutHint = () => (
    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
      <Typography variant="caption" color="text.secondary">
        Keyboard shortcuts: Ctrl+F (toggle search), F3 (next result), Shift+F3 (previous result)
      </Typography>
    </Box>
  );

  // Update the Transcription tab panel to include keyboard shortcut hint
  const renderTranscriptionTab = () => (
    <>
      {<AudioInfoCard audioInfoStr={meeting.audio_info} meeting={meeting} />}
      
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6">
              Meeting Transcription
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Click the search button to find keywords in the transcription or press Ctrl+F
            </Typography>
          </Box>
          <Tooltip
            title="Did you know? You can search for any keyword within the meeting transcript!"
            arrow
            placement="top"
            open={showTooltip}
            TransitionComponent={Zoom}
            sx={{ 
              '& .MuiTooltip-tooltip': {
                backgroundColor: 'primary.dark',
                color: 'white',
                fontSize: '0.9rem',
                p: 1.5,
                maxWidth: 300,
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
              }
            }}
          >
            <IconButton 
              onClick={() => {
                setShowSearch(!showSearch);
                setShowTooltip(false);
              }} 
              color={showSearch ? "primary" : "default"}
              title="Search (Ctrl+F)"
              sx={{ 
                position: 'relative',
                border: '1px solid',
                borderColor: showSearch ? 'primary.main' : 'grey.300',
                bgcolor: showSearch ? 'primary.light' : 'background.paper',
                '&:hover': {
                  bgcolor: showSearch ? 'primary.light' : 'grey.100',
                  borderColor: 'primary.main'
                },
                transition: 'all 0.2s ease',
                p: 1.2,
                ...(showPulseAnimation && !showSearch && pulseAnimation)
              }}
            >
              <SearchIcon fontSize="medium" />
              {!showSearch && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    position: 'absolute', 
                    bottom: -8, 
                    right: -8, 
                    backgroundColor: 'primary.main', 
                    color: 'white',
                    px: 1,
                    py: 0.2,
                    borderRadius: 1,
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  Search
                </Typography>
              )}
            </IconButton>
          </Tooltip>
        </Box>
        
        {showSearch && meeting.transcription && (
          <>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <TextField
                placeholder="Search in transcription"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                size="small"
                fullWidth
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {searchResults.length > 0 && (
                          <Typography variant="caption" sx={{ mr: 1 }}>
                            {currentResultIndex + 1} of {searchResults.length}
                          </Typography>
                        )}
                        <IconButton 
                          size="small" 
                          onClick={() => setSearchTerm('')}
                          sx={{ mr: 0.5 }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </InputAdornment>
                  )
                }}
                sx={{ mr: 1 }}
              />
              <Button 
                variant="contained" 
                onClick={handleSearch}
                disabled={!searchTerm.trim() || !meeting.transcription}
                size="small"
              >
                Find
              </Button>
              
              {searchResults.length > 0 && (
                <Box sx={{ display: 'flex', ml: 1 }}>
                  <IconButton 
                    size="small" 
                    onClick={() => navigateResults('prev')}
                    disabled={searchResults.length <= 1}
                    title="Previous (Shift+F3)"
                  >
                    <KeyboardArrowUpIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => navigateResults('next')}
                    disabled={searchResults.length <= 1}
                    title="Next (F3)"
                  >
                    <KeyboardArrowDownIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
            {renderSearchShortcutHint()}
          </>
        )}
        
        {meeting.transcription ? (
          <Paper 
            elevation={0} 
            variant="outlined" 
            sx={{ 
              p: 2, 
              whiteSpace: 'pre-wrap',
              maxHeight: '500px',
              overflow: 'auto'
            }}
            ref={transcriptionRef}
          >
            {showSearch && searchTerm ? 
              highlightSearchResults(meeting.transcription) : 
              meeting.transcription
            }
          </Paper>
        ) : (
          <Paper elevation={0} variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress size={30} sx={{ mb: 2 }} />
            <Typography>
              Transcription in progress... This may take a few minutes.
            </Typography>
          </Paper>
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={isLoading ? <CircularProgress size={16} /> : <PictureAsPdfIcon />}
          onClick={() => handleDownloadPdf('transcript')}
          disabled={!meeting.transcription || isLoading}
        >
          {isLoading ? 'Downloading...' : 'Download Transcript PDF'}
        </Button>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="translation-language-label">Target Language</InputLabel>
            <Select
              labelId="translation-language-label"
              id="translation-language"
              value={targetLanguage}
              label="Target Language"
              onChange={(e) => setTargetLanguage(e.target.value)}
              disabled={translationLoading || !meeting.transcription}
            >
              <MenuItem value="zh">Chinese (Mandarin)</MenuItem>
              <MenuItem value="es">Spanish</MenuItem>
              <MenuItem value="fr">French</MenuItem>
              <MenuItem value="de">German</MenuItem>
              <MenuItem value="ja">Japanese</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="outlined" 
            startIcon={<TranslateIcon />}
            onClick={handleTranslate}
            disabled={translationLoading || !meeting.transcription}
          >
            {translationLoading ? <CircularProgress size={24} /> : 'Translate'}
          </Button>
        </Box>
      </Box>
    </>
  );

  // Update the Action Items section to better format and display items
  const renderActionItems = () => {
    const actionItems = formatActionItems(meeting.action_items);
    
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Action Items
        </Typography>
        {actionItems.length > 0 ? (
          <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
            {actionItems.map((item, index) => (
              <Box key={index} sx={{ mb: 1.5, pl: 1 }}>
                <Typography variant="body1">
                  {/* Remove bullet points if they already exist in the text */}
                  {item.startsWith('•') || item.startsWith('-') || item.startsWith('*') 
                    ? item 
                    : `• ${item}`}
                </Typography>
              </Box>
            ))}
          </Paper>
        ) : (
          <Paper elevation={0} variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No action items found for this meeting.
            </Typography>
          </Paper>
        )}
      </Box>
    );
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
            startIcon={isLoading ? <CircularProgress size={16} /> : <PictureAsPdfIcon />}
            onClick={() => handleDownloadPdf('report')}
            disabled={!meeting.transcription || !meeting.summary || isLoading}
          >
            {isLoading ? 'Downloading...' : 'Download Full Report'}
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
          {renderTranscriptionTab()}
        </TabPanel>

        {/* Translation tab */}
        <TabPanel value={tabValue} index={1}>
          {meeting.translation ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6">
                    Translation
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Click the search button to find keywords in the translation or press Ctrl+F
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton 
                    onClick={() => setShowTranslationSearch(!showTranslationSearch)} 
                    color={showTranslationSearch ? "primary" : "default"}
                    title="Search (Ctrl+F)"
                    sx={{ 
                      position: 'relative',
                      border: '1px solid',
                      borderColor: showTranslationSearch ? 'primary.main' : 'grey.300',
                      bgcolor: showTranslationSearch ? 'primary.light' : 'background.paper',
                      '&:hover': {
                        bgcolor: showTranslationSearch ? 'primary.light' : 'grey.100',
                        borderColor: 'primary.main'
                      },
                      transition: 'all 0.2s ease',
                      p: 1.2,
                      ...(showPulseAnimation && !showTranslationSearch && pulseAnimation)
                    }}
                  >
                    <SearchIcon fontSize="medium" />
                    {!showTranslationSearch && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          position: 'absolute', 
                          bottom: -8, 
                          right: -8, 
                          backgroundColor: 'primary.main', 
                          color: 'white',
                          px: 1,
                          py: 0.2,
                          borderRadius: 1,
                          fontSize: '0.65rem',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                      >
                        Search
                      </Typography>
                    )}
                  </IconButton>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={isLoading ? <CircularProgress size={14} /> : <DownloadIcon />}
                    onClick={() => handleDownloadPdf('transcript')}
                    disabled={isLoading}
                    sx={{ ml: 1 }}
                  >
                    {isLoading ? 'Downloading...' : 'Download PDF'}
                  </Button>
                </Box>
              </Box>

              {showTranslationSearch && (
                <>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <TextField
                      placeholder="Search in translation"
                      value={translationSearchTerm}
                      onChange={(e) => setTranslationSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleTranslationSearch();
                        }
                      }}
                      size="small"
                      fullWidth
                      autoFocus
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: translationSearchTerm && (
                          <InputAdornment position="end">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {translationSearchResults.length > 0 && (
                                <Typography variant="caption" sx={{ mr: 1 }}>
                                  {currentTranslationResultIndex + 1} of {translationSearchResults.length}
                                </Typography>
                              )}
                              <IconButton 
                                size="small" 
                                onClick={() => setTranslationSearchTerm('')}
                                sx={{ mr: 0.5 }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </InputAdornment>
                        )
                      }}
                      sx={{ mr: 1 }}
                    />
                    <Button 
                      variant="contained" 
                      onClick={handleTranslationSearch}
                      disabled={!translationSearchTerm.trim()}
                      size="small"
                    >
                      Find
                    </Button>
                    
                    {translationSearchResults.length > 0 && (
                      <Box sx={{ display: 'flex', ml: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => navigateTranslationResults('prev')}
                          disabled={translationSearchResults.length <= 1}
                          title="Previous (Shift+F3)"
                        >
                          <KeyboardArrowUpIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => navigateTranslationResults('next')}
                          disabled={translationSearchResults.length <= 1}
                          title="Next (F3)"
                        >
                          <KeyboardArrowDownIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  {renderSearchShortcutHint()}
                </>
              )}
              
              <Divider sx={{ mb: 3 }} />
              <Box 
                sx={{ 
                  whiteSpace: 'pre-wrap',
                  maxHeight: '500px',
                  overflow: 'auto',
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1
                }}
                ref={translationRef}
              >
                {showTranslationSearch && translationSearchTerm ? 
                  highlightTranslationSearchResults(meeting.translation) : 
                  meeting.translation
                }
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
                <Box>
                  <Typography variant="h6">
                    Meeting Summary
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Click the search button to find keywords in the summary or press Ctrl+F
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton 
                    onClick={() => setShowSummarySearch(!showSummarySearch)} 
                    color={showSummarySearch ? "primary" : "default"}
                    title="Search (Ctrl+F)"
                    sx={{ 
                      position: 'relative',
                      border: '1px solid',
                      borderColor: showSummarySearch ? 'primary.main' : 'grey.300',
                      bgcolor: showSummarySearch ? 'primary.light' : 'background.paper',
                      '&:hover': {
                        bgcolor: showSummarySearch ? 'primary.light' : 'grey.100',
                        borderColor: 'primary.main'
                      },
                      transition: 'all 0.2s ease',
                      p: 1.2,
                      ...(showPulseAnimation && !showSummarySearch && pulseAnimation)
                    }}
                  >
                    <SearchIcon fontSize="medium" />
                    {!showSummarySearch && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          position: 'absolute', 
                          bottom: -8, 
                          right: -8, 
                          backgroundColor: 'primary.main', 
                          color: 'white',
                          px: 1,
                          py: 0.2,
                          borderRadius: 1,
                          fontSize: '0.65rem',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                      >
                        Search
                      </Typography>
                    )}
                  </IconButton>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={isLoading ? <CircularProgress size={14} /> : <DownloadIcon />}
                    onClick={() => handleDownloadPdf('summary')}
                    disabled={isLoading}
                    sx={{ ml: 1 }}
                  >
                    {isLoading ? 'Downloading...' : 'Download PDF'}
                  </Button>
                </Box>
              </Box>

              {showSummarySearch && (
                <>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <TextField
                      placeholder="Search in summary"
                      value={summarySearchTerm}
                      onChange={(e) => setSummarySearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSummarySearch();
                        }
                      }}
                      size="small"
                      fullWidth
                      autoFocus
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: summarySearchTerm && (
                          <InputAdornment position="end">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {summarySearchResults.length > 0 && (
                                <Typography variant="caption" sx={{ mr: 1 }}>
                                  {currentSummaryResultIndex + 1} of {summarySearchResults.length}
                                </Typography>
                              )}
                              <IconButton 
                                size="small" 
                                onClick={() => setSummarySearchTerm('')}
                                sx={{ mr: 0.5 }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </InputAdornment>
                        )
                      }}
                      sx={{ mr: 1 }}
                    />
                    <Button 
                      variant="contained" 
                      onClick={handleSummarySearch}
                      disabled={!summarySearchTerm.trim()}
                      size="small"
                    >
                      Find
                    </Button>
                    
                    {summarySearchResults.length > 0 && (
                      <Box sx={{ display: 'flex', ml: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => navigateSummaryResults('prev')}
                          disabled={summarySearchResults.length <= 1}
                          title="Previous (Shift+F3)"
                        >
                          <KeyboardArrowUpIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => navigateSummaryResults('next')}
                          disabled={summarySearchResults.length <= 1}
                          title="Next (F3)"
                        >
                          <KeyboardArrowDownIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  {renderSearchShortcutHint()}
                </>
              )}
              
              <Divider sx={{ mb: 3 }} />
              <Box 
                sx={{ 
                  whiteSpace: 'pre-wrap',
                  maxHeight: '500px',
                  overflow: 'auto',
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1
                }}
                ref={summaryRef}
              >
                {showSummarySearch && summarySearchTerm ? 
                  highlightSummarySearchResults(meeting.summary) : 
                  meeting.summary
                }
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
              <Typography variant="h6" gutterBottom>
                No Summary Available
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Summary generation is in progress or has failed.
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Action Items tab */}
        <TabPanel value={tabValue} index={3}>
          {renderActionItems()}
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