import React from 'react';
import { 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Box, 
  Container,
  Paper,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import TranslateIcon from '@mui/icons-material/Translate';
import SummarizeIcon from '@mui/icons-material/Summarize';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          textAlign: 'center', 
          mt: { xs: 4, md: 8 }, 
          mb: 6, 
          py: 8,
          px: 4,
          borderRadius: 4,
          background: `linear-gradient(120deg, ${theme.palette.primary.light}15, ${theme.palette.primary.main}20)`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '-5%', 
            right: '-5%', 
            width: '250px', 
            height: '250px',
            borderRadius: '50%',
            background: `linear-gradient(120deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}30)`,
            zIndex: 0
          }} 
        />
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: '-10%', 
            left: '-10%', 
            width: '300px', 
            height: '300px',
            borderRadius: '50%',
            background: `linear-gradient(120deg, ${theme.palette.secondary.light}15, ${theme.palette.secondary.main}25)`,
            zIndex: 0
          }} 
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            fontWeight="bold" 
            gutterBottom
            sx={{ 
              backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              color: 'transparent',
              WebkitBackgroundClip: 'text',
              display: 'inline-block'
            }}
          >
            Transform Your Meeting Audio
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary" 
            paragraph
            sx={{ 
              maxWidth: '800px', 
              mx: 'auto', 
              mb: 4
            }}
          >
            Upload your meeting audio and get AI-powered transcription, translation, 
            summary, and action items in minutes.
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
          >
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/upload')}
              sx={{ 
                px: 4, 
                py: 1.5,
                fontSize: '1.1rem',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)'
              }}
            >
              Upload Audio
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              onClick={() => navigate('/meetings')}
              sx={{ 
                px: 4, 
                py: 1.5,
                fontSize: '1.1rem'
              }}
            >
              View Meetings
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* How It Works Section */}
      <Box sx={{ mb: 10, textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          component="h2" 
          gutterBottom
          sx={{ 
            mb: 5,
            position: 'relative',
            display: 'inline-block'
          }}
        >
          How It Works
          <Box 
            sx={{ 
              position: 'absolute',
              bottom: -8,
              left: '25%',
              width: '50%',
              height: 4,
              bgcolor: 'primary.main',
              borderRadius: 2
            }} 
          />
        </Typography>

        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                height: '100%', 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200',
                textAlign: 'center'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="h4" color="white">1</Typography>
                </Box>
              </Box>
              <Typography variant="h5" gutterBottom>Upload Audio</Typography>
              <Typography color="text.secondary">
                Upload your meeting recording in various audio formats like MP3, WAV, M4A and more.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                height: '100%', 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200',
                textAlign: 'center'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="h4" color="white">2</Typography>
                </Box>
              </Box>
              <Typography variant="h5" gutterBottom>AI Processing</Typography>
              <Typography color="text.secondary">
                Our AI automatically transcribes the audio and generates a detailed summary with action items.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                height: '100%', 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200',
                textAlign: 'center'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%',
                    bgcolor: 'primary.dark',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="h4" color="white">3</Typography>
                </Box>
              </Box>
              <Typography variant="h5" gutterBottom>Get Results</Typography>
              <Typography color="text.secondary">
                View and download your transcripts, summaries, and action items in various formats.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Features Section */}
      <Typography 
        variant="h3" 
        component="h2" 
        gutterBottom
        sx={{ 
          mb: 5,
          textAlign: 'center',
          position: 'relative',
          display: 'inline-block'
        }}
      >
        Key Features
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: -8,
            left: 0,
            width: '50%',
            height: 4,
            bgcolor: 'primary.main',
            borderRadius: 2
          }} 
        />
      </Typography>
      <Grid container spacing={4} sx={{ mb: 10 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }} elevation={isMobile ? 1 : 0} variant={isMobile ? "elevation" : "outlined"}>
            <CardContent sx={{ p: 3 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 3,
                  width: 60,
                  height: 60,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  color: 'white',
                  alignItems: 'center',
                  mx: 'auto'
                }}
              >
                <MicIcon fontSize="large" />
              </Box>
              <Typography variant="h5" component="h2" align="center" gutterBottom fontWeight={600}>
                Transcription
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Accurate transcription of your meeting audio using advanced speech recognition technology. 
                Works with multiple languages and speaker accents.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }} elevation={isMobile ? 1 : 0} variant={isMobile ? "elevation" : "outlined"}>
            <CardContent sx={{ p: 3 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 3,
                  width: 60,
                  height: 60,
                  borderRadius: 2,
                  bgcolor: 'secondary.main',
                  color: 'white',
                  alignItems: 'center',
                  mx: 'auto'
                }}
              >
                <TranslateIcon fontSize="large" />
              </Box>
              <Typography variant="h5" component="h2" align="center" gutterBottom fontWeight={600}>
                Translation
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Translate your meeting transcripts to multiple languages including Spanish, French, German, 
                Chinese, Japanese and more.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }} elevation={isMobile ? 1 : 0} variant={isMobile ? "elevation" : "outlined"}>
            <CardContent sx={{ p: 3 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 3,
                  width: 60,
                  height: 60,
                  borderRadius: 2,
                  bgcolor: 'success.main',
                  color: 'white',
                  alignItems: 'center',
                  mx: 'auto'
                }}
              >
                <SummarizeIcon fontSize="large" />
              </Box>
              <Typography variant="h5" component="h2" align="center" gutterBottom fontWeight={600}>
                Smart Summaries
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Get concise, intelligent summaries of your meetings, highlighting the key points 
                discussed and decisions made.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }} elevation={isMobile ? 1 : 0} variant={isMobile ? "elevation" : "outlined"}>
            <CardContent sx={{ p: 3 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 3,
                  width: 60,
                  height: 60,
                  borderRadius: 2,
                  bgcolor: 'warning.main',
                  color: 'white',
                  alignItems: 'center',
                  mx: 'auto'
                }}
              >
                <AssignmentIcon fontSize="large" />
              </Box>
              <Typography variant="h5" component="h2" align="center" gutterBottom fontWeight={600}>
                Action Items
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Automatically identify and extract action items and tasks assigned during meetings, 
                so nothing falls through the cracks.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }} elevation={isMobile ? 1 : 0} variant={isMobile ? "elevation" : "outlined"}>
            <CardContent sx={{ p: 3 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 3,
                  width: 60,
                  height: 60,
                  borderRadius: 2,
                  bgcolor: 'info.main',
                  color: 'white',
                  alignItems: 'center',
                  mx: 'auto'
                }}
              >
                <PictureAsPdfIcon fontSize="large" />
              </Box>
              <Typography variant="h5" component="h2" align="center" gutterBottom fontWeight={600}>
                PDF Export
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Download transcripts, translations, summaries, and action items as beautifully 
                formatted PDF documents for easy sharing.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              background: `linear-gradient(135deg, ${theme.palette.grey[100]}, ${theme.palette.primary.light}20)`,
            }} 
            elevation={0}
          >
            <CardContent sx={{ p: 3, flexGrow: 1 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 3,
                  width: 60,
                  height: 60,
                  borderRadius: 2,
                  bgcolor: 'error.main',
                  color: 'white',
                  alignItems: 'center',
                  mx: 'auto'
                }}
              >
                <AutoAwesomeIcon fontSize="large" />
              </Box>
              <Typography variant="h5" component="h2" align="center" gutterBottom fontWeight={600}>
                Ready to Try?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Start analyzing your meeting audio now and see how much time you can save. No credit card required.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => navigate('/upload')}
                  sx={{ 
                    px: 4, 
                    py: 1,
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  Get Started
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage; 