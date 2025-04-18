import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box, extendTheme } from '@chakra-ui/react';
import Header from './components/Header';
import UploadPage from './pages/UploadPage';
import TranscriptPage from './pages/TranscriptPage';
import SearchPage from './pages/SearchPage';
import './App.css';

// Define theme with multilingual font support
const theme = extendTheme({
  fonts: {
    body: "Noto Sans, 'Noto Sans SC', 'Noto Sans HK', -apple-system, BlinkMacSystemFont, sans-serif",
    heading: "Noto Sans, 'Noto Sans SC', 'Noto Sans HK', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box minH="100vh" bg="gray.50">
          <Header />
          <Box as="main" p={4} maxW="1200px" mx="auto">
            <Routes>
              <Route path="/" element={<UploadPage />} />
              <Route path="/transcript/:id" element={<TranscriptPage />} />
              <Route path="/search" element={<SearchPage />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
