---
name: verify
description: Build, run, and drive the coach-tracking app end-to-end to verify changes.
---

# Verify coach-tracking

Next.js 16 App Router app + Railway Postgres. All DB access is server-side via `DATABASE_URL` (in `.env.local`, points at the Railway public proxy URL — local dev and prod share the same database, so clean up test rows).

## Build & run

```bash
npm run build        # type-checks too
npm run dev          # http://localhost:3000 (needs .env.local: DATABASE_URL, ADMIN_PASSWORD)
```

## Drive it

Playwright is installed (devDependency + chromium). A full drive script exists at `e2e-drive.mjs` (repo root) — 16 steps covering: admin login (wrong + right password), add coach, duplicate rejection, coach picker, logging sessions in all 6 buckets, progress math to 57 h, completion state, delete entry, archive/reactivate, logout. Run it with the dev server up:

```bash
set -a && source .env.local && set +a
SHOTS_DIR=/tmp node e2e-drive.mjs   # exits non-zero on any FAIL, writes screenshots
```

It creates a coach named "Coach Test" — delete it afterwards (cascade removes its sessions):

```sql
delete from coaches where name = 'Coach Test';
```

(run via `node db/apply-schema.mjs` pattern or a one-off `pg` script; `psql` is not installed on this machine).

## Gotchas

- Mobile-first: check at 390×844 viewport; admin also at desktop width.
- The dev-overlay "N" badge covers the bottom-left corner of screenshots — dev-only, ignore.
- Dates render French (`10 juil. 2026`); hours use comma decimals (`1,5 h`).
