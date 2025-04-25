import React from 'react';
import { Box, Container, Typography, Link, Grid, Divider, IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        backgroundColor: theme => theme.palette.grey[100],
        borderTop: '1px solid',
        borderColor: 'grey.200',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Meeting Analyzer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Transform your meeting audio into actionable insights with transcription, 
              summaries, and action items. Save time and never miss important details.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="text.secondary" sx={{ textDecoration: 'none' }}>
                Home
              </Link>
              <Link href="/upload" color="text.secondary" sx={{ textDecoration: 'none' }}>
                Upload Audio
              </Link>
              <Link href="/meetings" color="text.secondary" sx={{ textDecoration: 'none' }}>
                My Meetings
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Technologies
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="https://reactjs.org/" target="_blank" rel="noopener" color="text.secondary" sx={{ textDecoration: 'none' }}>
                React
              </Link>
              <Link href="https://fastapi.tiangolo.com/" target="_blank" rel="noopener" color="text.secondary" sx={{ textDecoration: 'none' }}>
                FastAPI
              </Link>
              <Link href="https://mui.com/" target="_blank" rel="noopener" color="text.secondary" sx={{ textDecoration: 'none' }}>
                Material UI
              </Link>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Meeting Analyzer. All rights reserved.
          </Typography>
          
          <Box>
            <IconButton color="primary" aria-label="GitHub" component="a" href="#" target="_blank">
              <GitHubIcon />
            </IconButton>
            <IconButton color="primary" aria-label="LinkedIn" component="a" href="#" target="_blank">
              <LinkedInIcon />
            </IconButton>
            <IconButton color="primary" aria-label="Twitter" component="a" href="#" target="_blank">
              <TwitterIcon />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 