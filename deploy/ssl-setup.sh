#!/usr/bin/env bash
set -Eeuo pipefail

# Run on the UAE host only after DNS is intentionally pointed to the host.
: "${CERTBOT_EMAIL:?Set CERTBOT_EMAIL to an operator mailbox}"

sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx
sudo mkdir -p /var/www/certbot
sudo nginx -t

# Certificate request is intentionally explicit; this script is not run by the project build.
sudo certbot --nginx --non-interactive --agree-tos --email "$CERTBOT_EMAIL" \
  -d msaffah.ae -d mosaffah.ae -d icad.ae
sudo systemctl enable --now certbot.timer
sudo certbot renew --dry-run
sudo nginx -t
sudo systemctl reload nginx
