import os

DEBUG = True

'''
export CHESSDB_NAME="CHESS_DB"
export CHESSDB_PASS="qwerty"
export CHESSDB_USER="chess_master"
'''

db_name = os.environ["CHESSDB_NAME"]
db_user = os.environ["CHESSDB_USER"]
db_pass = os.environ["CHESSDB_PASS"]

SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://' + db_user + ':' + db_pass + '@localhost/' + db_name

THREADS_PER_PAGE = 2

CSRF_ENABLED     = True