import axios from 'axios';

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
    const response = await api.post(`/meetings/${meetingId}/translate`, {
      target_language: targetLanguage,
    });
    return response.data;
  },

  // Get PDF URL
  getPdfUrl: (meetingId, pdfType) => {
    return `${API_URL}/meetings/${meetingId}/pdf/${pdfType}`;
  },

  // Delete meeting
  deleteMeeting: async (meetingId) => {
    const response = await api.delete(`/meetings/${meetingId}`);
    return response.data;
  },
};

export default apiService; 