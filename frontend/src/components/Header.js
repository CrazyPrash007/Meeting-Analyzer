import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Container,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Tooltip
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArticleIcon from '@mui/icons-material/Article';
import TimezoneSelector from './TimezoneSelector';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [elevated, setElevated] = useState(false);

  // Listen for scroll to add shadow effect when scrolled
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setElevated(scrollPosition > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Upload', icon: <UploadFileIcon />, path: '/upload' },
    { text: 'My Meetings', icon: <ArticleIcon />, path: '/meetings' },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 'bold' }}>
        Meeting Analyzer
      </Typography>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            component={RouterLink} 
            to={item.path}
            key={item.text}
            selected={isActive(item.path)}
            sx={{
              color: isActive(item.path) ? 'primary.main' : 'text.primary',
              '&.Mui-selected': {
                bgcolor: 'action.selected',
              }
            }}
          >
            <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'text.secondary' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem 
          button 
          component={RouterLink} 
          to="/profile"
          selected={isActive('/profile')}
          sx={{
            color: isActive('/profile') ? 'primary.main' : 'text.primary',
            '&.Mui-selected': {
              bgcolor: 'action.selected',
            }
          }}
        >
          <ListItemIcon sx={{ color: isActive('/profile') ? 'primary.main' : 'text.secondary' }}>
            <AccountCircleIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
      </List>
      <Box sx={{ p: 2 }}>
        <TimezoneSelector />
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed"
        color="default" 
        elevation={elevated ? 4 : 0}
        sx={{ 
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          bgcolor: 'background.paper',
          transition: 'box-shadow 0.3s ease',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ flexWrap: 'wrap' }}>
            <Typography 
              variant="h6" 
              color="inherit" 
              noWrap 
              sx={{ 
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                fontWeight: 'bold',
                textDecoration: 'none',
                color: 'text.primary',
                '&:hover': {
                  color: 'primary.main',
                }
              }}
              component={RouterLink}
              to="/"
            >
              Meeting Analyzer
            </Typography>

            {isMobile ? (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimezoneSelector compact />
                  <Divider orientation="vertical" flexItem sx={{ mx: 2, height: '24px' }} />
                  {menuItems.map((item) => (
                    <Button
                      key={item.text}
                      component={RouterLink}
                      to={item.path}
                      sx={{ 
                        mx: 1,
                        color: isActive(item.path) ? 'primary.main' : 'text.primary',
                        fontWeight: isActive(item.path) ? 'bold' : 'medium',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        }
                      }}
                      startIcon={item.icon}
                    >
                      {item.text}
                    </Button>
                  ))}
                  <Tooltip title="User Profile & Settings">
                    <IconButton 
                      component={RouterLink} 
                      to="/profile"
                      color={isActive('/profile') ? "primary" : "default"}
                      sx={{ 
                        ml: 1,
                        border: isActive('/profile') ? '1px solid' : 'none',
                        borderColor: 'primary.main',
                      }}
                    >
                      <AccountCircleIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Toolbar placeholder to prevent content from hiding behind the fixed AppBar */}
      <Toolbar />
      
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header; 