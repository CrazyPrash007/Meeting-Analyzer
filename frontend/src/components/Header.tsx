import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  Box, 
  Flex, 
  Heading, 
  Button, 
  HStack,
  useColorModeValue,
  Link,
  Icon
} from '@chakra-ui/react';
import { FaUpload, FaSearch, FaHome } from 'react-icons/fa';

const Header: React.FC = () => {
  const location = useLocation();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Box 
      as="nav" 
      bg={bg} 
      boxShadow="sm" 
      borderBottom="1px" 
      borderBottomColor={borderColor} 
      position="sticky" 
      top={0} 
      zIndex={10}
    >
      <Flex 
        maxW="1200px" 
        mx="auto" 
        py={4} 
        px={4} 
        align="center" 
        justify="space-between"
      >
        <HStack spacing={4}>
          <Heading size="md" color="brand.700">
            <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
              Multilingual Meeting Notes
            </Link>
          </Heading>
        </HStack>

        <HStack spacing={2}>
          <Button 
            as={RouterLink} 
            to="/" 
            leftIcon={<Icon as={FaHome} />} 
            colorScheme={isActive('/') ? 'brand' : 'gray'} 
            variant={isActive('/') ? 'solid' : 'ghost'}
            size="sm"
          >
            Home
          </Button>
          <Button 
            as={RouterLink} 
            to="/search" 
            leftIcon={<Icon as={FaSearch} />} 
            colorScheme={isActive('/search') ? 'brand' : 'gray'} 
            variant={isActive('/search') ? 'solid' : 'ghost'}
            size="sm"
          >
            Search
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header; 