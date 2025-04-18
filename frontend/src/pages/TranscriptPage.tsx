import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Divider,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  HStack,
  Badge,
  Spinner,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { FaFileAlt, FaFileDownload, FaListUl, FaCheckSquare } from 'react-icons/fa';
import axios from 'axios';

interface Transcript {
  id: number;
  filename: string;
  language: string;
  transcript_text: string;
}

interface Summary {
  id: number;
  summary: string;
  action_items: string;
  decisions: string;
}

const TranscriptPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/transcriptions/${id}`);
        setTranscript(response.data);
        
        // Check if summary exists
        try {
          const summaryResponse = await axios.get(`http://localhost:8000/api/summaries/${id}`);
          setSummary(summaryResponse.data);
        } catch (error) {
          // Summary doesn't exist yet, that's ok
        }
      } catch (error) {
        console.error('Error fetching transcript:', error);
        toast({
          title: 'Error',
          description: 'Failed to load the transcript',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTranscript();
    }
  }, [id, navigate, toast]);

  const generateSummary = async () => {
    if (!transcript) return;

    setIsSummarizing(true);
    try {
      const response = await axios.post('http://localhost:8000/api/summaries/', {
        transcript_id: transcript.id
      });
      
      setSummary(response.data);
      toast({
        title: 'Summary Generated',
        description: 'The transcript has been summarized successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate summary',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const exportPDF = async () => {
    if (!transcript || !summary) return;

    setIsExporting(true);
    try {
      const response = await axios.post('http://localhost:8000/api/exports/pdf', {
        transcript_id: transcript.id
      });
      
      // Open the PDF in a new tab
      window.open(`http://localhost:8000${response.data.download_url}`, '_blank');
      
      toast({
        title: 'PDF Generated',
        description: 'Your meeting notes have been exported as PDF',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to export PDF',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getLanguageBadge = (language: string) => {
    switch (language) {
      case 'en':
        return <Badge colorScheme="blue">English</Badge>;
      case 'zh-cn':
        return <Badge colorScheme="red">Mandarin</Badge>;
      case 'zh-hk':
        return <Badge colorScheme="orange">Cantonese</Badge>;
      default:
        return <Badge>{language}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Container centerContent py={20}>
        <Spinner size="xl" color="brand.500" thickness="4px" />
        <Text mt={4}>Loading transcript...</Text>
      </Container>
    );
  }

  if (!transcript) {
    return (
      <Container centerContent py={20}>
        <Text>Transcript not found</Text>
        <Button onClick={() => navigate('/')} mt={4} colorScheme="brand">
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            <HStack>
              <Icon as={FaFileAlt} color="brand.500" />
              <Text>{transcript.filename}</Text>
            </HStack>
          </Heading>
          <HStack spacing={4}>
            {getLanguageBadge(transcript.language)}
            <Text color="gray.500" fontSize="sm">
              ID: {transcript.id}
            </Text>
          </HStack>
        </Box>

        <HStack spacing={4}>
          {!summary && (
            <Button
              leftIcon={<Icon as={FaListUl} />}
              colorScheme="brand"
              onClick={generateSummary}
              isLoading={isSummarizing}
              loadingText="Generating"
            >
              Generate Summary
            </Button>
          )}
          
          {summary && (
            <Button
              leftIcon={<Icon as={FaFileDownload} />}
              colorScheme="teal"
              onClick={exportPDF}
              isLoading={isExporting}
              loadingText="Exporting"
            >
              Export as PDF
            </Button>
          )}
        </HStack>

        <Tabs variant="enclosed" colorScheme="brand">
          <TabList>
            <Tab>Transcript</Tab>
            {summary && <Tab>Summary</Tab>}
            {summary && summary.action_items && <Tab>Action Items</Tab>}
            {summary && summary.decisions && <Tab>Decisions</Tab>}
          </TabList>

          <TabPanels>
            <TabPanel>
              <Box bg="white" p={6} borderRadius="md" borderWidth="1px" whiteSpace="pre-wrap">
                {transcript.transcript_text}
              </Box>
            </TabPanel>

            {summary && (
              <TabPanel>
                <Box bg="white" p={6} borderRadius="md" borderWidth="1px" whiteSpace="pre-wrap">
                  {summary.summary}
                </Box>
              </TabPanel>
            )}

            {summary && summary.action_items && (
              <TabPanel>
                <Box bg="white" p={6} borderRadius="md" borderWidth="1px" whiteSpace="pre-wrap">
                  <Heading size="md" mb={4} display="flex" alignItems="center">
                    <Icon as={FaCheckSquare} mr={2} color="green.500" />
                    Action Items
                  </Heading>
                  {summary.action_items}
                </Box>
              </TabPanel>
            )}

            {summary && summary.decisions && (
              <TabPanel>
                <Box bg="white" p={6} borderRadius="md" borderWidth="1px" whiteSpace="pre-wrap">
                  <Heading size="md" mb={4}>
                    Key Decisions
                  </Heading>
                  {summary.decisions}
                </Box>
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default TranscriptPage; 