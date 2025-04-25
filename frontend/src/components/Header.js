import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, useTheme, useMediaQuery, IconButton, Menu, MenuItem } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ 
      backgroundColor: 'white', 
      borderBottom: '1px solid',
      borderColor: 'grey.200',
    }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: 'primary.main', 
              color: 'white', 
              p: 1, 
              borderRadius: 2,
              mr: 2
            }}>
              <RecordVoiceOverIcon />
            </Box>
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                textDecoration: 'none',
                letterSpacing: '0.5px',
              }}
            >
              Meeting Analyzer
            </Typography>
          </Box>

          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="end"
                color="primary"
                aria-label="menu"
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem 
                  component={RouterLink} 
                  to="/" 
                  onClick={handleClose}
                  selected={isActive('/')}
                >
                  <HomeIcon fontSize="small" sx={{ mr: 1 }} />
                  Home
                </MenuItem>
                <MenuItem 
                  component={RouterLink} 
                  to="/upload" 
                  onClick={handleClose}
                  selected={isActive('/upload')}
                >
                  <UploadFileIcon fontSize="small" sx={{ mr: 1 }} />
                  Upload Audio
                </MenuItem>
                <MenuItem 
                  component={RouterLink} 
                  to="/meetings" 
                  onClick={handleClose}
                  selected={isActive('/meetings')}
                >
                  <FormatListBulletedIcon fontSize="small" sx={{ mr: 1 }} />
                  My Meetings
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                component={RouterLink}
                to="/"
                startIcon={<HomeIcon />}
                sx={{ 
                  color: isActive('/') ? 'primary.main' : 'text.secondary',
                  fontWeight: isActive('/') ? 600 : 500,
                  borderRadius: 2,
                  py: 1,
                }}
              >
                Home
              </Button>
              <Button
                component={RouterLink}
                to="/upload"
                startIcon={<UploadFileIcon />}
                sx={{ 
                  color: isActive('/upload') ? 'primary.main' : 'text.secondary',
                  fontWeight: isActive('/upload') ? 600 : 500,
                  borderRadius: 2,
                  py: 1,
                }}
              >
                Upload Audio
              </Button>
              <Button
                component={RouterLink}
                to="/meetings"
                startIcon={<FormatListBulletedIcon />}
                sx={{ 
                  color: isActive('/meetings') ? 'primary.main' : 'text.secondary',
                  fontWeight: isActive('/meetings') ? 600 : 500,
                  borderRadius: 2,
                  py: 1,
                }}
              >
                My Meetings
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 