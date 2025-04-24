import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

const Header = () => {
  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <RecordVoiceOverIcon sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                fontWeight: 700,
                color: 'white',
                textDecoration: 'none',
              }}
            >
              Meeting Analyzer
            </Typography>
          </Box>

          <Box sx={{ display: 'flex' }}>
            <Button
              component={RouterLink}
              to="/"
              sx={{ color: 'white', mx: 1 }}
            >
              Home
            </Button>
            <Button
              component={RouterLink}
              to="/upload"
              sx={{ color: 'white', mx: 1 }}
            >
              Upload Audio
            </Button>
            <Button
              component={RouterLink}
              to="/meetings"
              sx={{ color: 'white', mx: 1 }}
            >
              My Meetings
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 