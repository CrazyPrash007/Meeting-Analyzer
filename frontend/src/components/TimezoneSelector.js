import React, { useState, useEffect } from 'react';
import { 
  FormControl, 
  Select, 
  MenuItem, 
  Typography, 
  Box, 
  Tooltip, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { 
  AVAILABLE_TIMEZONES, 
  getUserTimezone, 
  setUserTimezone, 
  getCurrentTimeWithTimezone,
  getTimezoneLabel 
} from '../utils/dateUtils';

/**
 * Component for displaying current time and selecting timezone
 */
const TimezoneSelector = ({ compact = false, showIcon = true }) => {
  const theme = useTheme();
  const [currentTimezone, setCurrentTimezone] = useState(getUserTimezone());
  const [currentTime, setCurrentTime] = useState(getCurrentTimeWithTimezone());
  const [dialogOpen, setDialogOpen] = useState(false);

  // Update the time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimeWithTimezone(currentTimezone));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentTimezone]);

  // Handle timezone change
  const handleTimezoneChange = (event) => {
    const newTimezone = event.target.value;
    setCurrentTimezone(newTimezone);
    setUserTimezone(newTimezone);
    setDialogOpen(false);
  };

  // Compact view for header/small areas
  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {showIcon && (
          <AccessTimeIcon 
            fontSize="small" 
            sx={{ mr: 1, color: 'text.secondary' }} 
          />
        )}
        <Tooltip 
          title="Click to change timezone" 
          arrow
          placement="bottom"
        >
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              cursor: 'pointer',
              '&:hover': {
                color: theme.palette.primary.main,
                textDecoration: 'underline'
              }
            }}
            onClick={() => setDialogOpen(true)}
          >
            {currentTime}
          </Typography>
        </Tooltip>
        
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Select Timezone</DialogTitle>
          <DialogContent sx={{ minWidth: 300 }}>
            <FormControl fullWidth sx={{ mt: 1 }}>
              <Select
                value={currentTimezone}
                onChange={handleTimezoneChange}
                autoFocus
              >
                {AVAILABLE_TIMEZONES.map((tz) => (
                  <MenuItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
              Current time in {getTimezoneLabel(currentTimezone)}:
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {currentTime}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Full view for settings/preference pages
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
        Timezone Settings
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary">
          Current time: {currentTime}
        </Typography>
      </Box>
      
      <FormControl fullWidth size="small">
        <Select
          value={currentTimezone}
          onChange={handleTimezoneChange}
          displayEmpty
        >
          {AVAILABLE_TIMEZONES.map((tz) => (
            <MenuItem key={tz.value} value={tz.value}>
              {tz.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Select your preferred timezone for displaying dates and times throughout the application.
      </Typography>
    </Box>
  );
};

export default TimezoneSelector; 