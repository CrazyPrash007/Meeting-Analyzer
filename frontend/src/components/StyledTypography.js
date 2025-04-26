import React from 'react';
import { Typography, useTheme } from '@mui/material';

/**
 * StyledTypography component that maintains consistent typography styling
 * Can be used as a drop-in replacement for the standard Typography component
 */
const StyledTypography = ({ 
  variant = 'body1', 
  color, 
  component,
  gradientText = false,
  children,
  ...props 
}) => {
  const theme = useTheme();
  
  // Default styling for gradient text effect
  const gradientStyle = gradientText ? {
    backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    display: 'inline-block'
  } : {};

  return (
    <Typography
      variant={variant}
      color={color}
      component={component}
      sx={{
        ...gradientStyle,
        ...(props.sx || {})
      }}
      {...props}
    >
      {children}
    </Typography>
  );
};

export default StyledTypography; 