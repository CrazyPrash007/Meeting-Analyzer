import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'Copyright © '}
          <Link color="inherit" href="/">
            Meeting Analyzer
          </Link>{' '}
          {new Date().getFullYear()}
          {'. Built with '}
          <Link color="inherit" href="https://reactjs.org/">
            React
          </Link>
          {', '}
          <Link color="inherit" href="https://fastapi.tiangolo.com/">
            FastAPI
          </Link>
          {', and '}
          <Link color="inherit" href="https://www.alibabacloud.com/">
            Alibaba Cloud ASR
          </Link>
          {'.'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 