import os

class Config:
    # Flask settings
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", "0")
    
    # Database settings for MySQL
    CHESSDB_HOST = os.getenv("CHESSDB_HOST", "localhost")
    CHESSDB_NAME = os.getenv("CHESSDB_NAME", "CHESS_DB")
    CHESSDB_USER = os.getenv("CHESSDB_USER", "")
    CHESSDB_PASS = os.getenv("CHESSDB_PASS", "")
    
    # Build the database URI for MySQL
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{CHESSDB_USER}:{CHESSDB_PASS}@{CHESSDB_HOST}/{CHESSDB_NAME}"
    
    # Flask-SQLAlchemy settings
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Avoid overhead of tracking modifications

    # Email settings (Optional, depending on usage)
    EMAIL_FROM_ADDRESS = os.getenv("EMAIL_FROM_ADDRESS", "")
    EMAIL_TO_ADDRESS = os.getenv("EMAIL_TO_ADDRESS", "")
    EMAIL_FROM_PASSWORD = os.getenv("EMAIL_FROM_PASSWORD", "")

config = Config()
