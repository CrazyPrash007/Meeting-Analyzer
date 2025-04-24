import React from 'react';
import { Typography, Button, Grid, Card, CardContent, CardActions, Box, Container } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import TranslateIcon from '@mui/icons-material/Translate';
import SummarizeIcon from '@mui/icons-material/Summarize';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Container>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mt: 8, mb: 6 }}>
        <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
          Transform Your Meeting Audio
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Upload your meeting audio and get transcription, translation, summary, and action items in minutes.
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          sx={{ mt: 4 }}
          onClick={() => navigate('/upload')}
        >
          Upload Audio
        </Button>
      </Box>

      {/* Features Section */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <MicIcon color="primary" fontSize="large" />
              </Box>
              <Typography variant="h5" component="h2" align="center" gutterBottom>
                Transcription
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Accurately transcribe your meeting audio using Alibaba Cloud ASR technology. Works with multiple languages and accents.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <TranslateIcon color="primary" fontSize="large" />
              </Box>
              <Typography variant="h5" component="h2" align="center" gutterBottom>
                Translation
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Translate your meeting transcripts to multiple languages to make content accessible to global team members.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <SummarizeIcon color="primary" fontSize="large" />
              </Box>
              <Typography variant="h5" component="h2" align="center" gutterBottom>
                Summary
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Get concise summaries of your meetings using DeepSeek AI, highlighting the key points discussed without the fluff.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <AssignmentIcon color="primary" fontSize="large" />
              </Box>
              <Typography variant="h5" component="h2" align="center" gutterBottom>
                Action Items
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Automatically extract action items and tasks assigned during the meeting, with responsible parties and deadlines.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <PictureAsPdfIcon color="primary" fontSize="large" />
              </Box>
              <Typography variant="h5" component="h2" align="center" gutterBottom>
                PDF Export
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Download transcripts, translations, summaries, and action items as beautifully formatted PDF documents.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h5" component="h2" align="center" gutterBottom>
                Ready to Try?
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Start analyzing your meeting audio now and see how much time you can save.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button 
                variant="outlined" 
                size="medium" 
                onClick={() => navigate('/upload')}
              >
                Get Started
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage; 