import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import MeetingsListPage from './pages/MeetingsListPage';
import MeetingDetailPage from './pages/MeetingDetailPage';
import UserProfile from './pages/UserProfile';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#4791db',
      dark: '#115293',
    },
    secondary: {
      main: '#7b1fa2',
      light: '#9c27b0',
      dark: '#6a1b9a',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app">
        <div className="app-container">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/meetings" element={<MeetingsListPage />} />
              <Route path="/meetings/:meetingId" element={<MeetingDetailPage />} />
              <Route path="/profile" element={<UserProfile />} />
            </Routes>
          </main>
          <Footer />
          <Toaster />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App; 