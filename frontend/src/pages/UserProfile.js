import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Divider, 
  Grid, 
  Card, 
  CardContent,
  TextField,
  Button,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  useTheme
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';
import TimezoneSelector from '../components/TimezoneSelector';

const UserProfile = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('settings');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  
  // Handle menu tab selection
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Show alert message
  const showAlert = (message, severity = 'success') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };
  
  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    showAlert('Settings saved successfully!');
  };
  
  // Sidebar menu items
  const menuItems = [
    { id: 'profile', label: 'Profile', icon: <PersonIcon /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
    { id: 'timezone', label: 'Timezone', icon: <AccessTimeIcon /> },
    { id: 'security', label: 'Security', icon: <SecurityIcon /> }
  ];

  // Render page content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              User Profile
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', mb: 3 }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'primary.main',
                  fontSize: '2rem'
                }}
              >
                U
              </Avatar>
              <Box sx={{ ml: 3 }}>
                <Typography variant="h6">
                  User
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  user@example.com
                </Typography>
              </Box>
            </Box>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    fullWidth
                    defaultValue="User"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    fullWidth
                    defaultValue=""
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    fullWidth
                    defaultValue="user@example.com"
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    type="submit" 
                    variant="contained"
                    sx={{ mt: 2 }}
                  >
                    Save Changes
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        );
        
      case 'timezone':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Timezone Preferences
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Select your preferred timezone to display dates and times throughout the application.
                  This setting affects how meeting times, recording dates, and the current time are displayed.
                </Typography>
                <TimezoneSelector />
              </CardContent>
            </Card>
          </Box>
        );
        
      case 'security':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Current Password"
                    type="password"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Confirm New Password"
                    type="password"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    type="submit" 
                    variant="contained"
                    sx={{ mt: 2 }}
                  >
                    Update Password
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        );
        
      default:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Application Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
                Time & Date
              </Typography>
              <TimezoneSelector />
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box>
              <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
                Notification Preferences
              </Typography>
              <form onSubmit={handleSubmit}>
                <Button 
                  type="submit" 
                  variant="contained"
                  sx={{ mt: 2 }}
                >
                  Save Settings
                </Button>
              </form>
            </Box>
          </Box>
        );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 0, 
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Grid container>
          {/* Sidebar */}
          <Grid 
            item 
            xs={12} 
            md={3} 
            sx={{ 
              borderRight: { md: '1px solid' },
              borderColor: { md: 'divider' },
              bgcolor: 'background.default',
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                User Settings
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List sx={{ p: 0 }}>
                {menuItems.map((item) => (
                  <ListItem 
                    key={item.id} 
                    disablePadding
                    sx={{ mb: 1 }}
                  >
                    <ListItemButton
                      onClick={() => handleTabChange(item.id)}
                      selected={activeTab === item.id}
                      sx={{
                        borderRadius: 1,
                        '&.Mui-selected': {
                          backgroundColor: 'primary.light',
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                          },
                          '& .MuiListItemIcon-root': {
                            color: 'primary.main',
                          }
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>
          
          {/* Main content */}
          <Grid item xs={12} md={9}>
            <Box sx={{ p: 4 }}>
              {renderContent()}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Feedback alert */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={5000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setAlertOpen(false)} 
          severity={alertSeverity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserProfile; 