#!/usr/bin/env python
"""
This script downloads the DejaVu Sans font for use with PDF generation.
DejaVu Sans is a font with good Unicode support.
"""

import os
import requests
import zipfile
import io
import shutil

# The URL to download DejaVu fonts
DEJAVU_URL = "https://github.com/dejavu-fonts/dejavu-fonts/releases/download/version_2_37/dejavu-fonts-ttf-2.37.zip"

# Directory to save fonts
FONTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "fonts")

def download_dejavu_fonts():
    """Download and extract DejaVu Sans fonts"""
    print(f"Creating fonts directory: {FONTS_DIR}")
    os.makedirs(FONTS_DIR, exist_ok=True)
    
    try:
        print(f"Downloading DejaVu fonts from {DEJAVU_URL}")
        response = requests.get(DEJAVU_URL)
        response.raise_for_status()
        
        print("Extracting fonts...")
        with zipfile.ZipFile(io.BytesIO(response.content)) as z:
            # Get the list of files in the zip
            file_list = z.namelist()
            
            # Find DejaVuSans.ttf in the archive
            dejavu_sans_files = [f for f in file_list if f.endswith("DejaVuSans.ttf")]
            
            if not dejavu_sans_files:
                print("Could not find DejaVuSans.ttf in the archive")
                return False
            
            # Extract the font
            dejavu_sans = dejavu_sans_files[0]
            print(f"Extracting {dejavu_sans}")
            
            font_content = z.read(dejavu_sans)
            output_path = os.path.join(FONTS_DIR, "DejaVuSans.ttf")
            
            with open(output_path, "wb") as f:
                f.write(font_content)
            
            print(f"DejaVu Sans font saved to {output_path}")
            return True
            
    except Exception as e:
        print(f"Error downloading fonts: {e}")
        return False

if __name__ == "__main__":
    success = download_dejavu_fonts()
    if success:
        print("DejaVu fonts downloaded successfully")
    else:
        print("Failed to download DejaVu fonts") 