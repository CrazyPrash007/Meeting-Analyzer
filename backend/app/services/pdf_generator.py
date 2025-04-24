import os
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    DEMO_MODE = False
except ImportError:
    DEMO_MODE = True
    print("Running in DEMO MODE - PDF generation will create placeholder files")
    
from ..core.config import settings

class PDFGeneratorService:
    """Service for generating PDF files from meeting data"""
    
    def __init__(self):
        self.pdf_dir = settings.PDF_DIR
    
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
        filename = f"transcript_{meeting_id}_{self._sanitize_filename(meeting_title)}.pdf"
        file_path = os.path.join(self.pdf_dir, filename)
        
        if DEMO_MODE:
            # Create a placeholder file in demo mode
            with open(file_path, 'w') as f:
                f.write(f"DEMO MODE - Transcript for {meeting_title}\n\n{transcript}")
            return file_path
            
        # Create PDF document
        doc = SimpleDocTemplate(file_path, pagesize=letter)
        styles = getSampleStyleSheet()
        
        # Create a custom style for the title
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=18,
            alignment=1,  # Center alignment
            spaceAfter=20
        )
        
        # Create a custom style for the transcript
        transcript_style = ParagraphStyle(
            'TranscriptStyle',
            parent=styles['Normal'],
            fontSize=12,
            leading=14,
            spaceAfter=10
        )
        
        # Create content elements
        elements = []
        
        # Add title
        elements.append(Paragraph(f"Meeting Transcript: {meeting_title}", title_style))
        elements.append(Spacer(1, 20))
        
        # Add transcript
        # Split transcript into paragraphs for better formatting
        paragraphs = transcript.split('\n\n')
        for paragraph in paragraphs:
            elements.append(Paragraph(paragraph, transcript_style))
            elements.append(Spacer(1, 10))
        
        # Build PDF
        doc.build(elements)
        
        return file_path
    
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
        filename = f"summary_{meeting_id}_{self._sanitize_filename(meeting_title)}.pdf"
        file_path = os.path.join(self.pdf_dir, filename)
        
        if DEMO_MODE:
            # Create a placeholder file in demo mode
            with open(file_path, 'w') as f:
                f.write(f"DEMO MODE - Summary for {meeting_title}\n\nSummary:\n{summary}\n\nAction Items:\n{action_items}")
            return file_path
            
        # Create PDF document
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
            elements.append(Paragraph(paragraph, normal_style))
        
        elements.append(Spacer(1, 15))
        
        # Add action items
        elements.append(Paragraph("Action Items", heading_style))
        
        # Format action items as a list
        action_items_list = action_items.split('\n')
        for item in action_items_list:
            if item.strip():
                elements.append(Paragraph(f"• {item}", normal_style))
        
        # Build PDF
        doc.build(elements)
        
        return file_path
    
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
        filename = f"report_{meeting_id}_{self._sanitize_filename(meeting_title)}.pdf"
        file_path = os.path.join(self.pdf_dir, filename)
        
        if DEMO_MODE:
            # Create a placeholder file in demo mode
            with open(file_path, 'w') as f:
                f.write(f"DEMO MODE - Full Report for {meeting_title}\n\nSummary:\n{summary}\n\nAction Items:\n{action_items}\n\nTranscript:\n{transcript}")
            return file_path
            
        # Create PDF document
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
        elements.append(Paragraph(summary, normal_style))
        elements.append(Spacer(1, 10))
        
        # Add action items section
        elements.append(Paragraph("Action Items", section_style))
        action_items_list = action_items.split('\n')
        for item in action_items_list:
            if item.strip():
                elements.append(Paragraph(f"• {item}", normal_style))
        
        # Add transcript section
        elements.append(Paragraph("Full Transcript", section_style))
        paragraphs = transcript.split('\n\n')
        for paragraph in paragraphs:
            elements.append(Paragraph(paragraph, normal_style))
        
        # Build PDF
        doc.build(elements)
        
        return file_path
    
    def _sanitize_filename(self, filename):
        """
        Sanitize filename to remove invalid characters
        
        Args:
            filename: Original filename
            
        Returns:
            Sanitized filename
        """
        # Replace invalid characters with underscores
        invalid_chars = ['<', '>', ':', '"', '/', '\\', '|', '?', '*']
        for char in invalid_chars:
            filename = filename.replace(char, '_')
        
        # Limit filename length
        max_length = 50
        if len(filename) > max_length:
            filename = filename[:max_length]
        
        return filename


# Create instance
pdf_generator_service = PDFGeneratorService() 