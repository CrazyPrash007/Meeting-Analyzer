import React, { useState, useEffect } from 'react';
import { 
  FormControl, 
  Select, 
  MenuItem, 
  Typography, 
  Box, 
  Tooltip, 
  InputLabel,
  Chip,
  Paper
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { 
  AVAILABLE_TIMEZONES, 
  getUserTimezone, 
  setUserTimezone, 
  getCurrentTimeWithTimezone,
  getTimezoneLabel,
  getTimezoneAbbreviation
} from '../utils/dateUtils';

/**
 * Component for displaying current time and selecting timezone
 */
const TimezoneSelector = ({ compact = false, showIcon = true }) => {
  const [currentTimezone, setCurrentTimezone] = useState(getUserTimezone());
  const [currentTime, setCurrentTime] = useState(getCurrentTimeWithTimezone(currentTimezone));

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
    
    // Force page refresh to update all displayed dates
    // This is a simple approach - in a larger app, we might use context or Redux
    window.location.reload();
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
        <Paper 
          elevation={0} 
          variant="outlined" 
          sx={{ 
            px: 1.5, 
            py: 0.5, 
            mr: 2, 
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'background.default'
          }}
        >
          <Typography 
            variant="body2" 
            color="text.primary" 
            fontWeight={500}
            sx={{ mr: 1 }}
          >
            {currentTime} <span style={{ opacity: 0.6 }}>{getTimezoneAbbreviation(currentTimezone)}</span>
          </Typography>
          <Chip
            label={getTimezoneLabel(currentTimezone)}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ height: 20, '& .MuiChip-label': { px: 1, py: 0 } }}
          />
        </Paper>
        
        <Tooltip title="Change timezone for date display" arrow>
          <Box>
            <Select
              value={currentTimezone}
              onChange={handleTimezoneChange}
              size="small"
              variant="outlined"
              sx={{ 
                minWidth: 120,
                '& .MuiSelect-select': {
                  py: 0.5,
                  fontSize: '0.8rem'
                }
              }}
            >
              <MenuItem disabled sx={{ opacity: 0.7, fontWeight: 'bold', fontSize: '0.7rem' }}>
                ───── TIMEZONES ─────
              </MenuItem>
              {AVAILABLE_TIMEZONES.map((tz) => (
                <MenuItem key={tz.value} value={tz.value}>
                  {tz.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Tooltip>
      </Box>
    );
  }

  // Full view for settings/preference pages
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Timezone Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Choose your preferred timezone for displaying meeting dates and times.
        This will affect how all dates are displayed throughout the application.
        <Box component="span" sx={{ fontWeight: 'bold', display: 'block', mt: 1 }}>
          Note: Future dates will be displayed in UTC by default for consistency.
        </Box>
      </Typography>
      
      <Paper 
        elevation={0} 
        variant="outlined" 
        sx={{ 
          p: 2, 
          mb: 3, 
          mt: 2, 
          borderRadius: 2,
          display: 'inline-block'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Current time:
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 500, my: 1 }}>
          {currentTime} <span style={{ opacity: 0.7, fontSize: '0.8em' }}>{getTimezoneAbbreviation(currentTimezone)}</span>
        </Typography>
        <Chip
          label={getTimezoneLabel(currentTimezone)}
          color="primary"
          size="small"
        />
      </Paper>
      
      <FormControl sx={{ minWidth: 250 }}>
        <InputLabel id="timezone-select-label">Timezone</InputLabel>
        <Select
          labelId="timezone-select-label"
          id="timezone-select"
          value={currentTimezone}
          label="Timezone"
          onChange={handleTimezoneChange}
        >
          <MenuItem disabled sx={{ opacity: 0.7 }}>
            ──────────────────
          </MenuItem>
          {AVAILABLE_TIMEZONES.map((tz) => (
            <MenuItem key={tz.value} value={tz.value}>
              {tz.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default TimezoneSelector; 