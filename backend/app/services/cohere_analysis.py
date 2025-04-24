import json
try:
    import cohere
    from langchain_core.prompts import PromptTemplate
    from langchain_core.output_parsers import StrOutputParser
    from langchain_cohere import ChatCohere
    DEMO_MODE = False
except ImportError:
    DEMO_MODE = True
    print("Running in DEMO MODE - Cohere AI analysis will return mock data")

from ..core.config import settings

class CohereAnalysisService:
    """Service for analysis, summarization and action item extraction using Cohere AI"""
    
    def __init__(self):
        self.api_key = settings.COHERE_API_KEY
        
        if not DEMO_MODE:
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
                """
            )
            
            # Create the LangChain processing chain
            self.chain = self.summary_prompt | self.model | StrOutputParser()
        else:
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
            Dictionary with summary and action_items
        """
        if DEMO_MODE:
            # Return demo data in demo mode
            return {
                "summary": "This is a demo summary. In production mode, this would be generated using Cohere AI analysis of the transcript.",
                "action_items": "- John: Create project timeline by next Friday\n- Sarah: Review the proposal by EOD\n- Team: Submit feedback on the new features by next week"
            }
            
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
                
                result = json.loads(json_content)
                return {
                    "summary": result.get("summary", "Failed to generate summary"),
                    "action_items": result.get("action_items", "No action items found")
                }
            except (json.JSONDecodeError, IndexError):
                # Fallback: Use direct Cohere API
                response = self.client.summarize(
                    text=transcript,
                    length="medium",
                    format="bullets",
                    extractiveness="medium"
                )
                
                # Get action items
                action_items_response = self.client.chat(
                    message=f"Extract all action items from this meeting transcript as a bulleted list. Only include clear action items with assigned people if possible: {transcript}",
                    model="command"
                )
                
                return {
                    "summary": response.summary,
                    "action_items": action_items_response.text
                }
                
        except Exception as e:
            print(f"Error calling Cohere API: {e}")
            return {
                "summary": "Failed to generate summary due to API error",
                "action_items": "Failed to extract action items due to API error"
            }
    
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


# Create instance
cohere_analysis_service = CohereAnalysisService() 