"""
CORS (Cross-Origin Resource Sharing) middleware
Handles different CORS configurations for main and admin applications
"""

from flask_cors import CORS
from flask import Flask
from typing import List

def setup_cors(app: Flask, app_type: str = 'main'):
    """
    Setup CORS for the Flask application
    
    Args:
        app: Flask application instance
        app_type: Type of application ('main' or 'admin')
    """
    
    if app_type == 'main':
        # Main app: Allow access from main frontend domains
        # This is more permissive since it's for public read-only access
        origins = [
            'http://localhost:5112',
            'http://127.0.0.1:5112',
        ]
        
        CORS(app, 
             origins=origins,
             methods=['GET'],
             allow_headers=['Content-Type', 'Authorization'],
             supports_credentials=True)
        
        print(f"🌐 CORS configured for main app with origins: {origins}")
        
    elif app_type == 'admin':
        # Admin app: Restrict to localhost only for security
        # This is very restrictive since it's for admin access only
        origins = [
            'http://localhost:5112',
            'http://127.0.0.1:5112',
        ]
        
        CORS(app, 
             origins=origins,
             methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
             allow_headers=['Content-Type', 'Authorization'],
             supports_credentials=True)
        
        print(f"🔒 CORS configured for admin app (localhost only): {origins}")
        
    else:
        raise ValueError(f"Invalid app_type: {app_type}. Must be 'main' or 'admin'")

def get_cors_origins(app_type: str) -> List[str]:
    """
    Get the list of allowed CORS origins for a given app type
    
    Args:
        app_type: Type of application ('main' or 'admin')
        
    Returns:
        List of allowed origins
    """
    if app_type == 'main':
        return [
            'http://localhost:5112',
            'http://127.0.0.1:5112',
        ]
    elif app_type == 'admin':
        return [
            'http://localhost:5112',
            'http://127.0.0.1:5112',
        ]
    else:
        raise ValueError(f"Invalid app_type: {app_type}. Must be 'main' or 'admin'") 