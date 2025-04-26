/**
 * Date utility functions for consistent date formatting across the application
 */

// List of available timezones with their display names
export const AVAILABLE_TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'UTC', label: 'Universal Time (UTC)' },
  { value: 'America/New_York', label: 'US Eastern (ET)' },
  { value: 'America/Los_Angeles', label: 'US Pacific (PT)' },
  { value: 'Europe/London', label: 'UK (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central European (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)' },
  { value: 'Asia/Shanghai', label: 'China (CST)' },
  { value: 'Australia/Sydney', label: 'Australia Eastern (AEST)' }
];

// Default timezone (IST)
const DEFAULT_TIMEZONE = 'Asia/Kolkata';

/**
 * Get the abbreviation for a timezone
 * @param {string} timezone - The timezone
 * @returns {string} The abbreviation for the timezone
 */
export const getTimezoneAbbreviation = (timezone) => {
  const abbreviations = {
    'Asia/Kolkata': 'IST',
    'UTC': 'UTC',
    'America/New_York': 'ET',
    'America/Los_Angeles': 'PT',
    'Europe/London': 'GMT',
    'Europe/Paris': 'CET',
    'Asia/Tokyo': 'JST',
    'Asia/Shanghai': 'CST',
    'Australia/Sydney': 'AEST'
  };
  
  return abbreviations[timezone] || timezone.split('/').pop();
};

/**
 * Get the user's preferred timezone
 * @returns {string} The timezone from localStorage or the default
 */
export const getUserTimezone = () => {
  try {
    // Initialize localStorage with default timezone if not set
    if (!localStorage.getItem('userTimezone')) {
      localStorage.setItem('userTimezone', DEFAULT_TIMEZONE);
    }
    
    const savedTimezone = localStorage.getItem('userTimezone');
    return savedTimezone || DEFAULT_TIMEZONE;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return DEFAULT_TIMEZONE;
  }
};

/**
 * Save the user's preferred timezone
 * @param {string} timezone - The timezone to save
 */
export const setUserTimezone = (timezone) => {
  try {
    localStorage.setItem('userTimezone', timezone);
    console.log(`Timezone set to: ${timezone}`);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Get the display name/label for a timezone
 * @param {string} timezone - The timezone value
 * @returns {string} The display name or abbreviation for the timezone
 */
export const getTimezoneLabel = (timezone) => {
  // First try to find the timezone in our predefined list
  const found = AVAILABLE_TIMEZONES.find(tz => tz.value === timezone);
  if (found) return found.label;
  
  // If not found, get the abbreviation
  return getTimezoneAbbreviation(timezone);
};

/**
 * Formats a date string to the user's preferred timezone or a specific timezone
 * @param {string} dateString - The date string to format
 * @param {string} timezone - Optional timezone override (defaults to user preference)
 * @returns {string} Formatted date string in the specified timezone
 */
export const formatDateWithTimezone = (dateString, timezone = null) => {
  if (!dateString) return 'Not available';
  
  try {
    // Create a valid date object
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date format:', dateString);
      return 'Invalid date format';
    }
    
    // If the date is in the future, use UTC for display
    const now = new Date();
    const isFutureDate = date > now;
    
    // Use UTC for future dates, otherwise use provided timezone or user preference
    const userTimezone = isFutureDate ? "UTC" : (timezone || getUserTimezone());
    
    // Format options
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: userTimezone
    };
    
    // Get the abbreviation based on timezone
    const timezoneAbbr = getTimezoneAbbreviation(userTimezone);
    
    return date.toLocaleString('en-US', options) + ` (${timezoneAbbr})`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date format error';
  }
};

/**
 * Formats a date string to Indian Standard Time (IST)
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string in IST timezone
 * @deprecated Use formatDateWithTimezone instead
 */
export const formatDateIST = (dateString) => {
  return formatDateWithTimezone(dateString, 'Asia/Kolkata');
};

/**
 * Gets current date and time in the user's preferred timezone
 * @param {string} timezone - Optional timezone override
 * @returns {string} Current date and time in the specified timezone
 */
export const getCurrentTimeWithTimezone = (timezone = null) => {
  const now = new Date();
  const userTimezone = timezone || getUserTimezone();
  
  // Format options - just time without the date
  const options = { 
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: userTimezone
  };
  
  return now.toLocaleString('en-US', options);
};

/**
 * Gets current date and time in IST
 * @returns {string} Current date and time in IST
 * @deprecated Use getCurrentTimeWithTimezone instead
 */
export const getCurrentTimeIST = () => {
  return getCurrentTimeWithTimezone('Asia/Kolkata');
};

/**
 * Calculates the time difference between now and a given date
 * @param {string} dateString - The date string to compare
 * @returns {string} Time difference in a human-readable format
 */
export const getTimeAgo = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    // Handle future dates
    if (diffInSeconds < 0) {
      // For future dates, return "in the future" instead of negative time
      const positiveSeconds = Math.abs(diffInSeconds);
      
      const positiveMinutes = Math.floor(positiveSeconds / 60);
      if (positiveMinutes < 60) {
        return `in ${positiveMinutes} ${positiveMinutes === 1 ? 'minute' : 'minutes'}`;
      }
      
      const positiveHours = Math.floor(positiveMinutes / 60);
      if (positiveHours < 24) {
        return `in ${positiveHours} ${positiveHours === 1 ? 'hour' : 'hours'}`;
      }
      
      const positiveDays = Math.floor(positiveHours / 24);
      if (positiveDays < 30) {
        return `in ${positiveDays} ${positiveDays === 1 ? 'day' : 'days'}`;
      }
      
      const positiveMonths = Math.floor(positiveDays / 30);
      if (positiveMonths < 12) {
        return `in ${positiveMonths} ${positiveMonths === 1 ? 'month' : 'months'}`;
      }
      
      const positiveYears = Math.floor(positiveMonths / 12);
      return `in ${positiveYears} ${positiveYears === 1 ? 'year' : 'years'}`;
    }
    
    // Handle recent past dates
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
    
  } catch (error) {
    console.error('Error calculating time difference:', error);
    return '';
  }
}; 