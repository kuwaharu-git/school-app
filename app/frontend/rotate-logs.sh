#!/bin/sh
# Log rotation script for Next.js access logs
# Rotates logs daily and keeps last 7 days for security inspection

LOG_DIR="/var/log/nextjs"
LOG_FILE="${LOG_DIR}/access.log"
ARCHIVE_DIR="${LOG_DIR}/archive"
RETENTION_DAYS=7

# Create archive directory if it doesn't exist
mkdir -p "${ARCHIVE_DIR}"

# Check if log file exists and has content
if [ -f "${LOG_FILE}" ] && [ -s "${LOG_FILE}" ]; then
    # Generate timestamp for archived log
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    ARCHIVE_FILE="${ARCHIVE_DIR}/access_${TIMESTAMP}.log"
    
    # Atomically move current log to archive and create new empty log
    # This prevents race conditions where logs could be lost during rotation
    mv "${LOG_FILE}" "${ARCHIVE_FILE}"
    touch "${LOG_FILE}"
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Log rotated: ${ARCHIVE_FILE}"
    
    # Compress archived log to save space
    gzip "${ARCHIVE_FILE}"
    
    # Remove logs older than retention period
    find "${ARCHIVE_DIR}" -name "access_*.log.gz" -type f -mtime +${RETENTION_DAYS} -delete
    
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Cleanup completed. Removed logs older than ${RETENTION_DAYS} days"
else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - No log file to rotate or file is empty"
fi
