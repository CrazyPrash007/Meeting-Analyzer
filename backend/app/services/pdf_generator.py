import os
import logging
import re
import unicodedata

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Try to import reportlab for PDF generation
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, ListFlowable, ListItem
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    
    # Try to load a Unicode-compatible font
    try:
        # Try to register DejaVu Sans which has good Unicode support
        # Use absolute path for more reliable resolution
        import os.path
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
        font_path = os.path.join(root_dir, "assets", "fonts", "DejaVuSans.ttf")
        
        if os.path.exists(font_path):
            pdfmetrics.registerFont(TTFont('DejaVuSans', font_path))
            logger.info("DejaVuSans font registered successfully")
        else:
            logger.warning(f"DejaVuSans font not found at {font_path}")
    except Exception as font_error:
        logger.warning(f"Error registering Unicode font: {font_error}")
    
    REPORTLAB_AVAILABLE = True
    logger.info("ReportLab is available for PDF generation")
except ImportError:
    REPORTLAB_AVAILABLE = False
    logger.warning("ReportLab not available - will generate text files instead of PDFs")
    
from ..core.config import settings

class PDFGeneratorService:
    """Service for generating PDF files from meeting data"""
    
    def __init__(self):
        self.pdf_dir = settings.PDF_DIR
        os.makedirs(self.pdf_dir, exist_ok=True)
    
    def generate_transcript_pdf(self, meeting_title, transcript, meeting_id):
        """
        Generate PDF file from transcript
        
        Args:
            meeting_title: Title of the meeting
            transcript: Transcript text
            meeting_id: Meeting ID for file naming
            
        Returns:
            Path to the generated PDF file
        """
        # Create filename
        filename = f"transcript_{meeting_id}_{self._sanitize_filename(meeting_title)}"
        
        # Use proper extension based on available libraries
        if REPORTLAB_AVAILABLE:
            file_path = os.path.join(self.pdf_dir, f"{filename}.pdf")
        else:
            file_path = os.path.join(self.pdf_dir, f"{filename}.txt")
            
        logger.info(f"Generating transcript file: {file_path}")
        
        try:
            if not REPORTLAB_AVAILABLE:
                # Create a formatted text file if reportlab is not available
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(f"=== TRANSCRIPT: {meeting_title} ===\n\n")
                    f.write(transcript)
                return file_path
                
            # Create PDF document using reportlab
            doc = SimpleDocTemplate(file_path, pagesize=letter)
            styles = getSampleStyleSheet()
            
            # Create a custom style for the title
            title_style = ParagraphStyle(
                'TitleStyle',
                parent=styles['Heading1'],
                fontSize=18,
                alignment=1,  # Center alignment
                spaceAfter=20,
                fontName='DejaVuSans' if 'DejaVuSans' in pdfmetrics.getRegisteredFontNames() else 'Helvetica'
            )
            
            # Create a custom style for the transcript
            transcript_style = ParagraphStyle(
                'TranscriptStyle',
                parent=styles['Normal'],
                fontSize=12,
                leading=14,
                spaceAfter=10,
                fontName='DejaVuSans' if 'DejaVuSans' in pdfmetrics.getRegisteredFontNames() else 'Helvetica'
            )
            
            # Create content elements
            elements = []
            
            # Add title
            safe_title = self._escape_xml(meeting_title)
            elements.append(Paragraph(f"Meeting Transcript: {safe_title}", title_style))
            elements.append(Spacer(1, 20))
            
            # Add transcript
            # Split transcript into paragraphs for better formatting
            safe_transcript = self._escape_xml(transcript)
            paragraphs = safe_transcript.split('\n\n')
            for paragraph in paragraphs:
                if paragraph.strip():
                    elements.append(Paragraph(paragraph.replace('\n', '<br/>'), transcript_style))
                    elements.append(Spacer(1, 10))
            
            # Build PDF
            doc.build(elements)
            
            return file_path
        except Exception as e:
            logger.error(f"Error generating transcript PDF: {e}")
            # Fallback to text file
            fallback_path = os.path.join(self.pdf_dir, f"{filename}.txt")
            with open(fallback_path, 'w', encoding='utf-8') as f:
                f.write(f"=== TRANSCRIPT: {meeting_title} ===\n\n")
                f.write(transcript)
            return fallback_path
    
    def generate_summary_pdf(self, meeting_title, summary, action_items, meeting_id):
        """
        Generate PDF file from summary and action items
        
        Args:
            meeting_title: Title of the meeting
            summary: Summary text
            action_items: Action items text
            meeting_id: Meeting ID for file naming
            
        Returns:
            Path to the generated PDF file
        """
        # Create filename
        filename = f"summary_{meeting_id}_{self._sanitize_filename(meeting_title)}"
        
        # Use proper extension based on available libraries
        if REPORTLAB_AVAILABLE:
            file_path = os.path.join(self.pdf_dir, f"{filename}.pdf")
        else:
            file_path = os.path.join(self.pdf_dir, f"{filename}.txt")
            
        logger.info(f"Generating summary file: {file_path}")
        
        try:
            if not REPORTLAB_AVAILABLE:
                # Create a formatted text file if reportlab is not available
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(f"=== SUMMARY: {meeting_title} ===\n\n")
                    f.write(f"SUMMARY:\n{summary}\n\n")
                    f.write(f"ACTION ITEMS:\n{action_items}")
                return file_path
                
            # Create PDF document using reportlab
            doc = SimpleDocTemplate(file_path, pagesize=letter)
            styles = getSampleStyleSheet()
            
            # Create custom styles
            title_style = ParagraphStyle(
                'TitleStyle',
                parent=styles['Heading1'],
                fontSize=18,
                alignment=1,  # Center alignment
                spaceAfter=20
            )
            
            heading_style = ParagraphStyle(
                'HeadingStyle',
                parent=styles['Heading2'],
                fontSize=14,
                spaceBefore=15,
                spaceAfter=10
            )
            
            normal_style = ParagraphStyle(
                'NormalStyle',
                parent=styles['Normal'],
                fontSize=12,
                leading=14,
                spaceAfter=10
            )
            
            # Create content elements
            elements = []
            
            # Add title
            elements.append(Paragraph(f"Meeting Summary: {meeting_title}", title_style))
            elements.append(Spacer(1, 20))
            
            # Add summary
            elements.append(Paragraph("Summary", heading_style))
            paragraphs = summary.split('\n\n')
            for paragraph in paragraphs:
                if paragraph.strip():
                    elements.append(Paragraph(paragraph.replace('\n', '<br/>'), normal_style))
            
            elements.append(Spacer(1, 15))
            
            # Add action items
            elements.append(Paragraph("Action Items", heading_style))
            
            # Format action items as a list
            action_items_list = action_items.split('\n')
            for item in action_items_list:
                if item.strip():
                    # Remove bullet points if they already exist
                    item = item.strip()
                    if item.startswith('•') or item.startswith('-') or item.startswith('*'):
                        item = item[1:].strip()
                    elements.append(Paragraph(f"• {item}", normal_style))
            
            # Build PDF
            doc.build(elements)
            
            return file_path
        except Exception as e:
            logger.error(f"Error generating summary PDF: {e}")
            # Fallback to text file
            fallback_path = os.path.join(self.pdf_dir, f"{filename}.txt")
            with open(fallback_path, 'w', encoding='utf-8') as f:
                f.write(f"=== SUMMARY: {meeting_title} ===\n\n")
                f.write(f"SUMMARY:\n{summary}\n\n")
                f.write(f"ACTION ITEMS:\n{action_items}")
            return fallback_path
    
    def generate_full_report_pdf(self, meeting_title, transcript, summary, action_items, meeting_id):
        """
        Generate a comprehensive PDF report with all meeting data
        
        Args:
            meeting_title: Title of the meeting
            transcript: Transcript text
            summary: Summary text
            action_items: Action items text
            meeting_id: Meeting ID for file naming
            
        Returns:
            Path to the generated PDF file
        """
        # Create filename
        filename = f"report_{meeting_id}_{self._sanitize_filename(meeting_title)}"
        
        # Use proper extension based on available libraries
        if REPORTLAB_AVAILABLE:
            file_path = os.path.join(self.pdf_dir, f"{filename}.pdf")
        else:
            file_path = os.path.join(self.pdf_dir, f"{filename}.txt")
            
        logger.info(f"Generating full report file: {file_path}")
        
        try:
            if not REPORTLAB_AVAILABLE:
                # Create a formatted text file if reportlab is not available
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(f"=== REPORT: {meeting_title} ===\n\n")
                    f.write(f"SUMMARY:\n{summary}\n\n")
                    f.write(f"ACTION ITEMS:\n{action_items}\n\n")
                    f.write(f"TRANSCRIPT:\n{transcript}")
                return file_path
                
            # Create PDF document using reportlab
            doc = SimpleDocTemplate(file_path, pagesize=letter)
            styles = getSampleStyleSheet()
            
            # Create custom styles
            title_style = ParagraphStyle(
                'TitleStyle',
                parent=styles['Heading1'],
                fontSize=18,
                alignment=1,  # Center alignment
                spaceAfter=20
            )
            
            section_style = ParagraphStyle(
                'SectionStyle',
                parent=styles['Heading2'],
                fontSize=16,
                spaceBefore=20,
                spaceAfter=10
            )
            
            normal_style = ParagraphStyle(
                'NormalStyle',
                parent=styles['Normal'],
                fontSize=12,
                leading=14,
                spaceAfter=10
            )
            
            # Create content elements
            elements = []
            
            # Add title
            elements.append(Paragraph(f"Meeting Report: {meeting_title}", title_style))
            elements.append(Spacer(1, 20))
            
            # Add summary section
            elements.append(Paragraph("Executive Summary", section_style))
            summary_paragraphs = summary.split('\n\n')
            for paragraph in summary_paragraphs:
                if paragraph.strip():
                    elements.append(Paragraph(paragraph.replace('\n', '<br/>'), normal_style))
            elements.append(Spacer(1, 10))
            
            # Add action items section
            elements.append(Paragraph("Action Items", section_style))
            action_items_list = action_items.split('\n')
            for item in action_items_list:
                if item.strip():
                    # Remove bullet points if they already exist
                    item = item.strip()
                    if item.startswith('•') or item.startswith('-') or item.startswith('*'):
                        item = item[1:].strip()
                    elements.append(Paragraph(f"• {item}", normal_style))
            
            # Add transcript section
            elements.append(Paragraph("Full Transcript", section_style))
            transcript_paragraphs = transcript.split('\n\n')
            for paragraph in transcript_paragraphs:
                if paragraph.strip():
                    elements.append(Paragraph(paragraph.replace('\n', '<br/>'), normal_style))
            
            # Build PDF
            doc.build(elements)
            
            return file_path
        except Exception as e:
            logger.error(f"Error generating full report PDF: {e}")
            # Fallback to text file
            fallback_path = os.path.join(self.pdf_dir, f"{filename}.txt")
            with open(fallback_path, 'w', encoding='utf-8') as f:
                f.write(f"=== REPORT: {meeting_title} ===\n\n")
                f.write(f"SUMMARY:\n{summary}\n\n")
                f.write(f"ACTION ITEMS:\n{action_items}\n\n")
                f.write(f"TRANSCRIPT:\n{transcript}")
            return fallback_path
    
    def _escape_xml(self, text):
        """
        Escape XML special characters for ReportLab's Paragraph
        
        Args:
            text: Text to escape
            
        Returns:
            Escaped text safe for ReportLab
        """
        if not text:
            return ""
            
        # Replace XML special characters
        replacements = [
            ('&', '&amp;'),
            ('<', '&lt;'),
            ('>', '&gt;'),
            ('"', '&quot;'),
            ("'", '&#39;')
        ]
        
        result = text
        for old, new in replacements:
            result = result.replace(old, new)
            
        return result

    def _sanitize_filename(self, filename):
        """
        Remove characters that are not allowed in filenames
        
        Args:
            filename: Original filename
            
        Returns:
            Sanitized filename
        """
        if not filename:
            return "untitled"
            
        # Normalize unicode characters
        filename = unicodedata.normalize('NFKD', filename).encode('ASCII', 'ignore').decode('ASCII')
        
        # Replace invalid characters with underscore
        return re.sub(r'[^\w\-\. ]', '_', filename)[:50]


# Create instance
pdf_generator_service = PDFGeneratorService() 