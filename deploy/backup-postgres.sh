#!/usr/bin/env bash
set -Eeuo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${MASFAH_BACKUP_DIR:?MASFAH_BACKUP_DIR is required}"
: "${MASFAH_BACKUP_KEY_FILE:?MASFAH_BACKUP_KEY_FILE is required}"

umask 077
mkdir -p "$MASFAH_BACKUP_DIR"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
plain="$MASFAH_BACKUP_DIR/masfah-$timestamp.sql"
archive="$MASFAH_BACKUP_DIR/masfah-$timestamp.sql.gz.enc"

pg_dump --format=plain --no-owner --no-privileges --dbname="$DATABASE_URL" > "$plain"
gzip -9 "$plain"
openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -in "$plain.gz" -out "$archive" -pass "file:$MASFAH_BACKUP_KEY_FILE"
sha256sum "$archive" > "$archive.sha256"
rm -f "$plain.gz"

find "$MASFAH_BACKUP_DIR" -type f \( -name 'masfah-*.sql.gz.enc' -o -name 'masfah-*.sql.gz.enc.sha256' \) -mtime +14 -delete
printf 'Encrypted backup created: %s\n' "$archive"
