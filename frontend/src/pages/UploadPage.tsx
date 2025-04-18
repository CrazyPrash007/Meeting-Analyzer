import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
  useToast,
  Progress,
  Icon,
} from '@chakra-ui/react';
import { FaUpload, FaMicrophone } from 'react-icons/fa';
import axios from 'axios';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select an audio file to upload',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('audio_file', file);
      
      if (language) {
        formData.append('language', language);
      }

      const response = await axios.post('http://localhost:8000/api/transcriptions/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });

      toast({
        title: 'Upload successful',
        description: 'Your audio has been transcribed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Navigate to the transcript page
      navigate(`/transcript/${response.data.id}`);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your file',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Icon as={FaMicrophone} w={12} h={12} color="brand.500" mb={4} />
          <Heading size="xl" mb={2}>Meeting Note Assistant</Heading>
          <Text fontSize="lg" color="gray.600">
            Upload your meeting audio for transcription and summarization
          </Text>
        </Box>

        <Box
          borderWidth="1px"
          borderRadius="lg"
          p={6}
          borderStyle="dashed"
          borderColor="gray.300"
          bg="white"
        >
          <VStack spacing={4}>
            <FormControl>
              <FormLabel fontWeight="bold">Select Audio File</FormLabel>
              <Input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                p={1}
                border="none"
              />
              <Text fontSize="sm" color="gray.500" mt={1}>
                Supported formats: MP3, WAV, M4A
              </Text>
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="bold">Language (Optional)</FormLabel>
              <RadioGroup onChange={setLanguage} value={language}>
                <Stack direction="row" spacing={4}>
                  <Radio value="en">English</Radio>
                  <Radio value="zh-cn">Mandarin</Radio>
                  <Radio value="zh-hk">Cantonese</Radio>
                  <Radio value="">Auto-detect</Radio>
                </Stack>
              </RadioGroup>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Auto-detect works best for clear audio
              </Text>
            </FormControl>

            {isUploading && (
              <Box w="100%">
                <Text mb={1} fontSize="sm">Uploading: {uploadProgress}%</Text>
                <Progress value={uploadProgress} size="sm" colorScheme="brand" />
              </Box>
            )}

            <Button
              leftIcon={<Icon as={FaUpload} />}
              colorScheme="brand"
              size="lg"
              width="full"
              onClick={handleUpload}
              isLoading={isUploading}
              loadingText="Uploading & Transcribing"
              mt={4}
            >
              Upload and Transcribe
            </Button>
          </VStack>
        </Box>

        <Box bg="white" p={6} borderRadius="md" borderWidth="1px">
          <Heading size="md" mb={4}>Multilingual Support</Heading>
          <Text>
            Our assistant works with meetings in English, Mandarin, and Cantonese.
            The AI will help transcribe, summarize, and extract action items from your meetings.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default UploadPage; 