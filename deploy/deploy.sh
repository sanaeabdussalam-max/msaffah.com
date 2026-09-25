#!/usr/bin/env bash
set -Eeuo pipefail

# Review-only deployment helper. Run on the target UAE host only after approval.
: "${MASFAH_RELEASE:?Set MASFAH_RELEASE to a reviewed release directory}"
: "${MASFAH_ROOT:=/opt/masfah}"
: "${MASFAH_ENV_FILE:=/etc/masfah/masfah.env}"

if [[ "${MASFAH_ALLOW_DEPLOY:-NO}" != "YES" ]]; then
  echo 'Refusing to deploy. Set MASFAH_ALLOW_DEPLOY=YES after the launch gate is approved.' >&2
  exit 2
fi

[[ -d "$MASFAH_RELEASE" ]] || { echo "Release directory not found: $MASFAH_RELEASE" >&2; exit 1; }
[[ -f "$MASFAH_ENV_FILE" ]] || { echo "Environment file not found: $MASFAH_ENV_FILE" >&2; exit 1; }

cd "$MASFAH_RELEASE"
npm ci --omit=dev
npm run typecheck
npm run lint
npm run build

ln -sfn "$MASFAH_RELEASE" "$MASFAH_ROOT/current"
sudo systemctl daemon-reload
sudo systemctl restart masfah
sleep 3
curl --fail --silent --show-error http://127.0.0.1:3000/api/health >/dev/null
sudo systemctl --no-pager --full status masfah
printf 'Release deployed and health check passed.\n'
