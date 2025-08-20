#!/bin/bash

# Configuration
DB_NAME="CHESS_DB"
BACKUP_DIR="./backups"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="chess_db_backup_${DATE}.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
echo "Starting backup of $DB_NAME database..."
/home/avaraby1/soft/mysql/mysql-8.4.1-linux-glibc2.28-x86_64/bin/mysqldump --socket=/home/avaraby1/MySQL/socket -u root -p \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --hex-blob \
  --complete-insert \
  --extended-insert \
  --add-drop-database \
  --databases "$DB_NAME" | gzip > "$BACKUP_DIR/$BACKUP_FILE"

# copy the data directory to the backup directory
cp -r ../CHESSApp_back/data "$BACKUP_DIR/data_${DATE}"

if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_DIR/$BACKUP_FILE"
    # Get file size
    ls -lh "$BACKUP_DIR/$BACKUP_FILE"
else
    echo "Backup failed!"
    exit 1
fi

# Optional: Remove backups older than 30 days
find "$BACKUP_DIR" -name "chess_db_backup_*.sql.gz" -type f -mtime +30 -delete

echo "Backup process completed."