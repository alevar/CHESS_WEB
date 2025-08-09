# Config package initialization
import os
from .environments import config as env_config, BaseConfig, DevelopmentConfig, ProductionConfig

class Config:
    """Legacy configuration class for backward compatibility"""
    
    # Flask settings
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", "0")
    
    # File upload settings for large FASTA files
    MAX_CONTENT_LENGTH = 50000 * 1024 * 1024  # 50GB max file size
    UPLOAD_TIMEOUT = 10800  # 3 hour timeout for uploads
    
    # Database settings for MySQL
    CHESSDB_HOST = os.getenv("CHESSDB_HOST", "localhost")
    CHESSDB_NAME = os.getenv("CHESSDB_NAME", "CHESS_DB")
    CHESSDB_USER = os.getenv("CHESSDB_USER", "")
    CHESSDB_PASS = os.getenv("CHESSDB_PASS", "")
    
    # Build the database URI for MySQL
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{CHESSDB_USER}:{CHESSDB_PASS}@{CHESSDB_HOST}/{CHESSDB_NAME}"
    
    # Flask-SQLAlchemy settings
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    CORS_ORIGINS = ['http://localhost:5112', 'http://localhost:5113']

config = Config()

def get_config():
    """Get configuration based on environment"""
    env = os.getenv('FLASK_ENV', 'development')
    return env_config.get(env, env_config['default'])

__all__ = [
    'Config',
    'get_config', 
    'config',
    'env_config',
    'BaseConfig',
    'DevelopmentConfig', 
    'ProductionConfig',
] 