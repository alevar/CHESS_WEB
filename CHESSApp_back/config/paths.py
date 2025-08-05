"""
Global configuration for data directory paths used throughout the CHESS Web App.
"""

import os

DATA_BASE_DIR = os.path.join(os.getcwd(), 'data')

FASTA_FILES_DIR = os.path.join(DATA_BASE_DIR, 'fasta_files')
SOURCE_FILES_DIR = os.path.join(DATA_BASE_DIR, 'source_files')
TEMP_FILES_DIR = os.path.join(DATA_BASE_DIR, 'temp_files')

def ensure_data_directories():
    """Create all data directories if they don't exist."""
    directories = [
        DATA_BASE_DIR,
        FASTA_FILES_DIR,
        SOURCE_FILES_DIR,
        TEMP_FILES_DIR
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)

ensure_data_directories() 