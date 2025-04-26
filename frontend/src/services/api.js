import axios from 'axios';
import saveAs from 'file-saver';
import { getUserTimezone } from '../utils/dateUtils';

const API_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions
const apiService = {
  // Upload meeting audio
  uploadMeetingAudio: async (formData) => {
    // Add user's timezone to the form data
    formData.append('timezone', getUserTimezone());
    
    const response = await api.post('/meetings/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all meetings
  getMeetings: async () => {
    const response = await api.get('/meetings');
    return response.data;
  },

  // Get meeting by ID
  getMeeting: async (meetingId) => {
    const response = await api.get(`/meetings/${meetingId}`);
    return response.data;
  },

  // Translate meeting
  translateMeeting: async (meetingId, targetLanguage) => {
    try {
      const response = await api.post(`/meetings/${meetingId}/translate?target_language=${targetLanguage}`);
      return response.data;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  },

  // Get PDF URL (deprecated, use downloadPdf instead)
  getPdfUrl: (meetingId, pdfType) => {
    return `${API_URL}/meetings/${meetingId}/pdf/${pdfType}`;
  },

  // Download PDF using file-saver
  downloadPdf: async (meetingId, pdfType, meeting) => {
    try {
      // Use axios to get the file as a blob
      const response = await axios({
        url: `${API_URL}/meetings/${meetingId}/pdf/${pdfType}`,
        method: 'GET',
        responseType: 'blob',
      });

      // Create a meaningful filename based on the meeting title
      const title = meeting?.title || `meeting-${meetingId}`;
      const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${sanitizedTitle}_${pdfType}.pdf`;

      // Use file-saver to save the blob
      saveAs(new Blob([response.data]), filename);
      
      return { success: true };
    } catch (error) {
      console.error('PDF download error:', error);
      
      // Fall back to text download if PDF fails
      try {
        const textResponse = await axios({
          url: `${API_URL}/meetings/${meetingId}/text/${pdfType}`,
          method: 'GET',
          responseType: 'blob',
        });
        
        // Create a filename for the text file
        const title = meeting?.title || `meeting-${meetingId}`;
        const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `${sanitizedTitle}_${pdfType}.txt`;
        
        // Save the text file
        saveAs(new Blob([textResponse.data]), filename);
        
        return { success: true, format: 'text' };
      } catch (textError) {
        console.error('Text download error:', textError);
        throw error;
      }
    }
  },

  // Delete meeting
  deleteMeeting: async (meetingId) => {
    const response = await api.delete(`/meetings/${meetingId}`);
    return response.data;
  },
};

export default apiService; 