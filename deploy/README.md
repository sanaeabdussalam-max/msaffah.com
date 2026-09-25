# MASFAH UAE deployment pack

## Status

This directory contains deployment artefacts only. Nothing in this pack has been executed, no server has been provisioned, no DNS has been changed, and the site has not been published.

Beta testing continues against the approved Supabase Mumbai project. UAE production must use a separately approved UAE PostgreSQL connection; do not treat the Mumbai database as production.

## Files

- `.env.production.example` — server-only production environment template.
- `masfah.service` — systemd service for Next.js.
- `nginx/masfah.conf` — reverse proxy for `msaffah.ae`, `mosaffah.ae`, and `icad.ae`.
- `ssl-setup.sh` — explicit Certbot setup; run only after a DNS cutover decision.
- `deploy.sh` — guarded release deployment; requires `MASFAH_ALLOW_DEPLOY=YES`.
- `rollback.sh` — guarded symlink rollback; requires `MASFAH_ALLOW_ROLLBACK=YES`.
- `backup-postgres.sh` — encrypted logical backup with checksum and 14-day local retention.
- `masfah-backup.service` — manual/on-demand encrypted backup unit; configure an approved scheduler on the UAE host if recurring backups are later authorized.

## Target host preparation

Recommended baseline from the existing architecture decision:

- UAE-hosted Ubuntu Server 24.04 LTS.
- Node.js 22 LTS.
- PostgreSQL 17 on localhost/private networking only.
- Nginx on ports 80/443.
- A non-root `masfah` Linux user.
- `/opt/masfah/releases/<release>` for immutable releases.
- `/opt/masfah/current` symlink for the active release.
- `/etc/masfah/masfah.env` mode 0600.
- `/etc/masfah/backup.key` mode 0600 and readable only by the backup user.

Minimum inbound firewall:

- TCP 80 and 443 from the internet.
- SSH only from an administrator allowlist or VPN/bastion.
- PostgreSQL 5432 not public.

## Database connection and schema gate

1. Create a UAE PostgreSQL database and separate runtime/migration roles.
2. Put runtime `DATABASE_URL` and migration `DIRECT_URL` in `/etc/masfah/masfah.env`.
3. Run `npm ci`, `npm run prisma:generate`, `npm run typecheck`, `npm run lint`, and `npm run build`.
4. Do not run `prisma migrate deploy` automatically. The current Prisma schema and the deployed Mumbai snake_case schema have drift; the UAE production schema must be explicitly reconciled and reviewed first.
5. Take a verified database backup and schema snapshot before any approved production migration.
6. Run the migration manually only after a separate review/approval gate.

## Release procedure (later, not now)

```bash
export MASFAH_RELEASE=/opt/masfah/releases/<release-id>
export MASFAH_ALLOW_DEPLOY=YES
sudo -E bash deploy/deploy.sh
```

The script installs production dependencies, runs typecheck/lint/build, switches the `current` symlink, restarts systemd, and checks `/api/health`.

## Backup procedure (later, not now)

- Store the encryption password in `/etc/masfah/backup.key`, outside the repository.
- Install and enable the service/timer after confirming the backup destination and UAE residency requirements.
- Copy encrypted backup files to a private off-server destination when selected.
- Keep at least 14 daily, 8 weekly, and 3 monthly backups in the approved retention system.
- Perform and record restore tests before launch and monthly thereafter.
- The included script only enforces 14-day local retention; off-server retention must be configured separately.

## SSL procedure (later, not now)

1. Confirm the selected canonical domain and the DNS provider.
2. Point only the approved hostnames to the UAE server IP after launch approval.
3. Install the Nginx config and run `nginx -t`.
4. Run `CERTBOT_EMAIL=<operator-mailbox> ./deploy/ssl-setup.sh`.
5. Confirm HTTPS on every required hostname and certificate renewal with `certbot renew --dry-run`.
6. Enable HSTS only after all hostnames and redirects are confirmed.

## Domain configuration plan — no DNS changes included

| Hostname | Proposed role | DNS at launch |
|---|---|---|
| `msaffah.ae` | canonical MASFAH host (pending final decision) | A/AAAA to UAE reverse proxy |
| `mosaffah.ae` | Arabic/alternate host | A/AAAA to same reverse proxy or redirect |
| `icad.ae` | ICAD context host | A/AAAA to same reverse proxy |

The current Nginx file routes these three names to the same app. `msaffah.com` remains in the prior architecture proposal but was not requested in this deployment pack; add it only after confirming ownership and canonical strategy.

Before DNS:

- Confirm registrar access for each domain.
- Confirm the UAE server public IP.
- Lower TTL only during an approved cutover window.
- Validate ACME certificate coverage.
- Prepare rollback records to the previous target if one exists.
- Do not change DNS during Beta testing.

## Rollback plan

### Application rollback

1. Stop new deployment activity.
2. Identify the last known-good release under `/opt/masfah/releases`.
3. Verify the release checksum and environment compatibility.
4. Run `MASFAH_ALLOW_ROLLBACK=YES MASFAH_RELEASE=/opt/masfah/releases/<known-good> bash deploy/rollback.sh`.
5. Confirm `/api/health`, homepage, search, admin authorization, and WhatsApp disabled status.
6. Record the incident and preserve logs.

### Database rollback

- Do not attempt to reverse destructive migrations with ad-hoc SQL.
- Restore to a separate temporary database first and validate.
- For an approved rollback, stop writes, take a current backup, restore the approved backup, validate counts and constraints, then reopen the application.
- Any production migration must have a tested restore path before execution.

### DNS rollback

- DNS rollback is a separate, explicit operator action and is not included in these files.
- Restore prior A/AAAA/CNAME records only after confirming the old target is healthy.
- DNS propagation may outlive the chosen TTL.

## Launch checklist

### Before launch

- [ ] New UAE hosting selected and approved; no paid infrastructure created without approval.
- [ ] Database residency and backup residency confirmed.
- [ ] Runtime and migration roles separated.
- [ ] Secrets installed outside the repository with restrictive permissions.
- [ ] Schema diff reconciled and explicitly approved.
- [ ] Backup created and restore test passed.
- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] `/api/health` returns database `ok`.
- [ ] Search reads only intended published/searchable records.
- [ ] Admin APIs reject missing/invalid token.
- [ ] CSV/XLSX import remains staged until review.
- [ ] AL JALLAF remains DRAFT, unpublished, unsearchable, and unverified until its new license and details are approved.
- [ ] WhatsApp endpoint remains disabled.
- [ ] Canonical domain decision approved.
- [ ] DNS change window and rollback records prepared.

### Launch validation

- [ ] HTTPS works for each approved hostname.
- [ ] HTTP redirects to HTTPS.
- [ ] Nginx configuration test passes.
- [ ] Home page loads.
- [ ] Search returns expected published records only.
- [ ] Admin dashboard loads only with valid server token.
- [ ] Private tables are not browser-readable.
- [ ] Backup timer is active and first backup verified.
- [ ] No secrets appear in logs or browser responses.

### Post-launch

- [ ] Monitor 5xx, latency, CPU, memory, disk, and certificate expiry.
- [ ] Confirm backup freshness within 24 hours.
- [ ] Record the release ID and schema version.
- [ ] Keep WhatsApp disabled until separately approved.
