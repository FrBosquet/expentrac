# Integer cents migration

Storage uses PostgreSQL INTEGER cents for Contract/Period and retained legacy Loan/Subscription money fields. Prisma exposes `feeCents`/`initialCents` with `@map` so physical column names remain unchanged. Range: 0–2,147,483,647 cents (€21,474,836.47). Decimal inputs and old stored euro values round half-up to cents; negative/nonfinite/out-of-range historical values stop the migration before conversion.

Splits operate on each payment's integer cents. The owner receives the first remainder cent, followed by accepted recipients sorted by ID. Duplicate/pending recipients do not receive another allocation. Current accepted membership is used, matching the existing app's current-share view; this is not a ledger of historical acceptance changes. Viewer identity selects the correct share. Totals derive from per-payment allocations; formatting converts to euros at UI/email boundaries. Legacy notification money fields are normalized while reading.

## Verified locally

`pnpm test:money` creates old-schema synthetic rows, takes a real `pg_dump` backup, migrates, checks rounded cents in all affected tables, restores with `pg_restore`, verifies original data and rejects an unsafe negative-value migration with rollback. On macOS install the client-only `libpq` tools; Linux CI runs PostgreSQL 17 client tools in Docker. These checks never use production credentials or data.

## Production sequence — not executed

The release entry point is `scripts/migrate-production.mjs`. It never loads `.env` or `.env.local`: inject `EXPENTRAC_MIGRATION_URL` securely with a direct PostgreSQL connection. Run from the repository root with pinned Node/pnpm versions. Preserve required SSL settings. Install PostgreSQL client tools at least as new as the server.

```sh
# Read-only inspection: no schema or data writes.
pnpm migration:production
```

First run on an isolated restored copy. The report contains money counts, invalid values, expected rounded cent totals, duplicate share groups and legacy inventory. Invalid money or mixed units cause a nonzero exit. Counts do not establish legacy equivalence: use `pnpm migration:reconcile` and the [legacy reconciliation procedure](legacy-reconciliation.md). The runner preserves all legacy rows.

After stopping application traffic and cron, set `EXPENTRAC_MAINTENANCE_CONFIRMED=true`, `EXPENTRAC_RESTORE_REHEARSED=true` (only after rehearsal), and `EXPENTRAC_MIGRATION_BACKUP_DIR` to a **new** directory outside the repository on durable encrypted storage with sufficient space.

```sh
pnpm migration:production --apply
```

Apply takes an advisory lock against concurrent runners, repeats inspection, exclusively creates a private backup directory, writes `before.json`, takes `before.dump` with `pg_dump`, applies **all pending checked-in Prisma migrations**, verifies integer column types, unchanged row/non-null counts and exact expected cent totals, and writes `after.json`. Credentials go to PostgreSQL tools through environment variables, never command arguments or reports. Existing backup directories are rejected. Prisma history prevents conversion from running twice; already converted integers are inspected in cents. Failed backups stop deployment. Later failures leave the backup intact and return nonzero. Preserve the dump securely: it contains private application data.

The advisory lock prevents simultaneous runners, not application writes: enforce maintenance operationally. Counts/totals do not replace a restore rehearsal or application smoke checks. On failure, keep traffic stopped and inspect Prisma migration history privately before retrying. Do not mark a failed migration applied without verifying its transaction state.

Recovery: restore `before.dump` using `pg_restore --no-owner --no-acl --exit-on-error --dbname <isolated-recovery-database>` into an empty replacement database with secure credential injection. Verify it, switch the previous application version to that database, then reopen traffic. Never blindly restore over a live database. The dump includes migration history, so units and history recover together. A down migration cannot recover discarded fractional cents.

1. Confirm provider/server version, available connections, backup retention and a successful restore into an isolated database. Confirm restored row counts and sums before continuing.
2. Run a read-only reconciliation against the restored copy: counts, monetary ranges, rounding deltas, orphan/duplicate shares and legacy→Contract equivalence. Review every exception. A synthetic fixture does not validate actual production data.
3. Schedule a maintenance window and disable writes/financial reads. This migration changes units in place: old application code cannot run against converted columns.
4. Take a fresh restorable backup, apply the reviewed migration, deploy the matching generated client and code, run owner/recipient/third-user and monetary smoke checks, then restore access.
5. On failure, stop writes and restore the pre-migration backup with the previous application version. Do not divide values blindly: rounding cannot recover original fractional cents. Reconcile any intervening writes before recovery.

Do not retire the legacy tables until actual data reconciliation and rollback rehearsal pass. No production migration, deployment, data equivalence, backup restoration or SSL/pooling verification is claimed by this implementation.
