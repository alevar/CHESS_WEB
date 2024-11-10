import pymysql
from config import config

def get_db_connection():
    return pymysql.connect(
        host=config.CHESSDB_HOST,
        user=config.CHESSDB_USER,
        password=config.CHESSDB_PASS,
        database=config.CHESSDB_NAME,
        cursorclass=pymysql.cursors.DictCursor,
    )
