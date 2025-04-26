import json
import cohere
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_cohere import ChatCohere

from ..core.config import settings

class CohereAnalysisService:
    """Service for analysis, summarization and action item extraction using Cohere AI"""
    
    def __init__(self):
        self.api_key = settings.COHERE_API_KEY
        
        try:
            # Initialize direct Cohere client
            self.client = cohere.Client(api_key=self.api_key)
            
            # Initialize LangChain with Cohere
            self.model = ChatCohere(
                cohere_api_key=self.api_key,
                model="command",  # Use Cohere's command model
                temperature=0.2,
            )
            
            # Create a prompt template
            self.summary_prompt = PromptTemplate.from_template(
                """You are an AI assistant that analyzes meeting transcripts.
                
                Please analyze the following meeting transcript and provide:
                1. A concise summary of the key points discussed
                2. A list of action items in format: [Person] - [Action] - [Deadline if mentioned]
                
                Meeting Transcript:
                {transcript}
                
                Format your response as JSON with two keys: 'summary' and 'action_items'.
                For action_items, make sure to provide a STRING of bullet points, NOT a list/array.
                
                Each action item should start with the person's name followed by a colon.
                For example:
                "action_items": "• John: Submit the report by Friday\n• Sarah: Schedule follow-up meeting\n• Team: Review documentation"
                """
            )
            
            # Create the LangChain processing chain
            self.chain = self.summary_prompt | self.model | StrOutputParser()
            print("Cohere AI client initialized successfully")
        except Exception as e:
            print(f"Error initializing Cohere AI client: {e}")
            self.client = None
            self.model = None
            self.chain = None
            self.summary_prompt = None
    
    def analyze_transcript(self, transcript):
        """
        Analyze transcript using Cohere to extract summary and action items
        
        Args:
            transcript: The meeting transcript text
            
        Returns:
            Dictionary with summary and action_items as strings
        """
        if not self.client:
            raise Exception("Cohere AI client not initialized")
            
        try:
            # Try using LangChain with Cohere first
            ai_response = self.chain.invoke({"transcript": transcript})
            
            # Try to extract JSON from the response
            try:
                # Find JSON content (might be inside ```json ``` blocks)
                json_content = ai_response
                if "```json" in ai_response:
                    json_content = ai_response.split("```json")[1].split("```")[0].strip()
                elif "```" in ai_response:
                    json_content = ai_response.split("```")[1].strip()
                
                # Clean JSON content by replacing invalid control characters
                json_content = self._clean_json_string(json_content)
                
                result = json.loads(json_content)
                
                # Convert action_items to string if it's a list
                action_items = result.get("action_items", "No action items found")
                if isinstance(action_items, list):
                    action_items = "\n".join([f"• {item}" for item in action_items])
                
                # Ensure action items have proper bullet points
                action_items = self._format_action_items(action_items)
                
                return {
                    "summary": str(result.get("summary", "Failed to generate summary")),
                    "action_items": action_items
                }
            except (json.JSONDecodeError, IndexError) as e:
                print(f"Error parsing JSON from LangChain response: {e}. Falling back to direct API.")
                # Fallback: Use direct Cohere API
                response = self.client.summarize(
                    text=transcript,
                    length="medium",
                    format="bullets",
                    extractiveness="medium"
                )
                
                # Get action items with improved prompt
                action_items_response = self.client.chat(
                    message=f"""Extract all action items from this meeting transcript as a bulleted list. 
                    Format each action item starting with the person responsible, followed by a colon, then the action.
                    If deadline is mentioned, include it.
                    Example format:
                    • John: Submit the report by Friday
                    • Sarah: Schedule follow-up meeting
                    • Team: Review documentation
                    
                    Meeting transcript: {transcript}""",
                    model="command"
                )
                
                # Ensure action items have proper bullet points
                action_items = self._format_action_items(action_items_response.text)
                
                return {
                    "summary": str(response.summary),
                    "action_items": action_items
                }
                
        except Exception as e:
            print(f"Error calling Cohere API: {e}")
            # Try alternative approach with simpler API calls
            try:
                # Directly use chat API for both summary and action items
                summary_response = self.client.chat(
                    message=f"Summarize this meeting transcript in 3-5 bullet points: {transcript}",
                    model="command"
                )
                
                action_items_response = self.client.chat(
                    message=f"""Extract all action items from this meeting transcript as a bulleted list.
                    Format each action item starting with the person responsible, followed by a colon, then the action.
                    If deadline is mentioned, include it.
                    
                    Meeting transcript: {transcript}""",
                    model="command"
                )
                
                # Ensure action items have proper bullet points
                action_items = self._format_action_items(action_items_response.text)
                
                return {
                    "summary": str(summary_response.text),
                    "action_items": action_items
                }
            except Exception as e2:
                print(f"Final error calling Cohere API: {e2}")
                return {
                    "summary": "Failed to generate summary due to API error",
                    "action_items": "No action items found"
                }
    
    def _format_action_items(self, action_items_text):
        """Format action items with consistent bullet points"""
        if not action_items_text or action_items_text.strip() == "":
            return "No action items found"
            
        # Split by lines and clean up
        lines = [line.strip() for line in action_items_text.split('\n') if line.strip()]
        formatted_lines = []
        
        for line in lines:
            # Skip headers or non-action lines
            if "action item" in line.lower() and len(line) < 30:
                continue
                
            # Remove existing bullet points of various types
            if line.startswith(('•', '-', '*', '>', '1.', '2.', '3.')):
                line = line[line.find(' ')+1:].strip()
                
            # Add consistent bullet point format
            formatted_lines.append(f"• {line}")
        
        # If no valid lines were found, return default message
        if not formatted_lines:
            return "No action items found"
            
        return "\n".join(formatted_lines)
    
    def _extract_summary(self, text):
        """Extract summary from text if JSON parsing fails"""
        if "summary" in text.lower():
            # Try to extract summary section
            lines = text.split("\n")
            summary_lines = []
            capture = False
            
            for line in lines:
                if "summary" in line.lower() and not capture:
                    capture = True
                    continue
                if capture and ("action item" in line.lower() or "action:" in line.lower()):
                    break
                if capture:
                    summary_lines.append(line)
            
            return "\n".join(summary_lines).strip()
        
        # Fallback
        return text[:500] + "..." if len(text) > 500 else text
    
    def _extract_action_items(self, text):
        """Extract action items from text if JSON parsing fails"""
        if "action item" in text.lower() or "action:" in text.lower():
            # Try to extract action items section
            lines = text.split("\n")
            action_lines = []
            capture = False
            
            for line in lines:
                if ("action item" in line.lower() or "action:" in line.lower()) and not capture:
                    capture = True
                    continue
                if capture and line.strip() == "":
                    continue
                if capture:
                    action_lines.append(line)
            
            return "\n".join(action_lines).strip()
        
        # Fallback
        return "No action items found"

    def _clean_json_string(self, json_string):
        """Clean JSON string by removing invalid control characters"""
        import re
        # Remove control characters (except for whitespace)
        pattern = r'[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]'
        return re.sub(pattern, '', json_string)


# Create instance
cohere_analysis_service = CohereAnalysisService() 