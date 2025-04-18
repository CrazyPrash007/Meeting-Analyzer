import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
  List,
  ListItem,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { FaSearch, FaFileAlt } from 'react-icons/fa';
import axios from 'axios';

interface SearchResult {
  id: number;
  filename: string;
  language: string;
  transcript_text: string;
  summary: string | null;
  relevance_snippet: string | null;
}

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a search term',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSearching(true);
    try {
      const params: Record<string, string> = { q: searchQuery };
      if (language) {
        params.language = language;
      }
      
      const response = await axios.get('http://localhost:8000/api/search/', { params });
      setResults(response.data.results);
      setTotalResults(response.data.total);
      
      if (response.data.total === 0) {
        toast({
          title: 'No results found',
          description: 'Try a different search term or language filter',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: 'There was an error performing your search',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const viewTranscript = (id: number) => {
    navigate(`/transcript/${id}`);
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'en':
        return 'English';
      case 'zh-cn':
        return 'Mandarin';
      case 'zh-hk':
        return 'Cantonese';
      default:
        return lang;
    }
  };

  // Function to highlight search terms in text
  const highlightText = (text: string) => {
    if (!searchQuery.trim() || !text) return text;
    
    // Simple highlighting by splitting on the search term
    // For a real app, you'd want more sophisticated highlighting
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() 
        ? <mark key={i} style={{ backgroundColor: '#FEEBC8' }}>{part}</mark> 
        : part
    );
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl" mb={2}>Search Transcripts</Heading>
          <Text fontSize="lg" color="gray.600">
            Find information across all your meeting transcripts
          </Text>
        </Box>

        <Box bg="white" p={6} borderRadius="md" borderWidth="1px">
          <VStack spacing={4} align="stretch">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search for keywords or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </InputGroup>

            <Box>
              <Text fontWeight="bold" mb={2}>Filter by Language</Text>
              <RadioGroup onChange={setLanguage} value={language}>
                <Stack direction="row" spacing={4}>
                  <Radio value="">All Languages</Radio>
                  <Radio value="en">English</Radio>
                  <Radio value="zh-cn">Mandarin</Radio>
                  <Radio value="zh-hk">Cantonese</Radio>
                </Stack>
              </RadioGroup>
            </Box>

            <Button
              leftIcon={<Icon as={FaSearch} />}
              colorScheme="brand"
              onClick={handleSearch}
              isLoading={isSearching}
              loadingText="Searching"
              mt={2}
            >
              Search
            </Button>
          </VStack>
        </Box>

        {results.length > 0 && (
          <Box>
            <Text fontWeight="bold" mb={4}>
              {totalResults} result{totalResults !== 1 ? 's' : ''} found
            </Text>
            
            <List spacing={4}>
              {results.map((result) => (
                <ListItem 
                  key={result.id}
                  p={4}
                  bg="white"
                  borderRadius="md"
                  borderWidth="1px"
                  _hover={{ borderColor: 'brand.500', boxShadow: 'sm' }}
                >
                  <Box onClick={() => viewTranscript(result.id)} cursor="pointer">
                    <Heading size="md" display="flex" alignItems="center">
                      <Icon as={FaFileAlt} mr={2} color="brand.500" />
                      {result.filename}
                    </Heading>
                    
                    <Text color="gray.500" fontSize="sm" mt={1}>
                      Language: {getLanguageLabel(result.language)} | ID: {result.id}
                    </Text>
                    
                    {result.relevance_snippet && (
                      <Box mt={3} p={3} bg="gray.50" borderRadius="md">
                        <Text fontWeight="bold" fontSize="sm" mb={1}>
                          Relevant Context:
                        </Text>
                        <Text fontSize="sm">
                          {highlightText(result.relevance_snippet)}
                        </Text>
                      </Box>
                    )}
                    
                    {result.summary && (
                      <Box mt={3}>
                        <Text fontWeight="bold" fontSize="sm">
                          Summary:
                        </Text>
                        <Text fontSize="sm" noOfLines={2}>
                          {result.summary}
                        </Text>
                      </Box>
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default SearchPage; 