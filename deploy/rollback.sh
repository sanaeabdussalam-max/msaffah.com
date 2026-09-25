#!/usr/bin/env bash
set -Eeuo pipefail

: "${MASFAH_ROOT:=/opt/masfah}"
: "${MASFAH_RELEASE:?Set MASFAH_RELEASE to the known-good release directory}"

if [[ "${MASFAH_ALLOW_ROLLBACK:-NO}" != "YES" ]]; then
  echo 'Refusing to rollback. Set MASFAH_ALLOW_ROLLBACK=YES after incident approval.' >&2
  exit 2
fi

[[ -d "$MASFAH_RELEASE" ]] || { echo "Known-good release not found: $MASFAH_RELEASE" >&2; exit 1; }
ln -sfn "$MASFAH_RELEASE" "$MASFAH_ROOT/current"
sudo systemctl restart masfah
sleep 3
curl --fail --silent --show-error http://127.0.0.1:3000/api/health >/dev/null
printf 'Rollback completed and health check passed: %s\n' "$MASFAH_RELEASE"
