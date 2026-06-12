#!/bin/bash

# Define directories
DB_PATH="/var/www/whatsapp-ai-frontdesk/data/database.db"
BACKUP_DIR="/var/www/whatsapp-ai-frontdesk/backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_PATH="${BACKUP_DIR}/database_${TIMESTAMP}.db"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Run safe SQLite backup
if [ -f "${DB_PATH}" ]; then
    sqlite3 "${DB_PATH}" ".backup '${BACKUP_PATH}'"
    echo "Backup created successfully: ${BACKUP_PATH}"
    
    # Keep only the last 10 backups to save disk space
    cd "${BACKUP_DIR}"
    # List files sorted by time, skip directories, take everything after the first 10, and delete them
    ls -t database_*.db 2>/dev/null | tail -n +11 | xargs -I {} rm -- {}
    echo "Cleaned up old backups, keeping only the latest 10."
else
    echo "Error: Database file not found at ${DB_PATH}"
    exit 1
fi
