"""
Middleware utilities
Common middleware functions and decorators
"""

from functools import wraps
from flask import request, jsonify, current_app
import time

def require_json(f):
    """
    Decorator to require JSON content type for requests
    
    Args:
        f: Function to decorate
        
    Returns:
        Decorated function
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        return f(*args, **kwargs)
    return decorated_function

def validate_required_fields(required_fields: list):
    """
    Decorator to validate required fields in JSON request body
    
    Args:
        required_fields: List of required field names
        
    Returns:
        Decorator function
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.is_json:
                return jsonify({'error': 'Content-Type must be application/json'}), 400
            
            data = request.get_json()
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                return jsonify({
                    'error': 'Missing required fields',
                    'missing_fields': missing_fields
                }), 400
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator



def cache_response(ttl_seconds: int = 300):
    """
    Simple in-memory response cache decorator
    
    Args:
        ttl_seconds: Time to live for cached responses in seconds
        
    Returns:
        Decorator function
    """
    cache = {}
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Create cache key from function name and request path
            cache_key = f"{f.__name__}:{request.path}"
            
            current_time = time.time()
            
            # Check if we have a cached response
            if cache_key in cache:
                cached_data, cached_time = cache[cache_key]
                if current_time - cached_time < ttl_seconds:
                    return cached_data
            
            # Get fresh response
            response = f(*args, **kwargs)
            
            # Cache the response
            cache[cache_key] = (response, current_time)
            
            return response
        return decorated_function
    return decorator



def validate_content_length(max_size_mb: int = 10):
    """
    Decorator to validate request content length
    
    Args:
        max_size_mb: Maximum content length in MB
        
    Returns:
        Decorator function
    """
    max_size_bytes = max_size_mb * 1024 * 1024
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if request.content_length and request.content_length > max_size_bytes:
                return jsonify({
                    'error': 'Request too large',
                    'message': f'Request size exceeds {max_size_mb}MB limit'
                }), 413
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def add_response_headers(headers: dict):
    """
    Decorator to add custom response headers
    
    Args:
        headers: Dictionary of headers to add
        
    Returns:
        Decorator function
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            response = f(*args, **kwargs)
            
            # Add headers to response
            for key, value in headers.items():
                response.headers[key] = value
            
            return response
        return decorated_function
    return decorator

 