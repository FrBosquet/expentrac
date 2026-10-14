# Integer cents migration

Storage uses PostgreSQL INTEGER cents for Contract/Period and retained legacy Loan/Subscription money fields. Prisma exposes `feeCents`/`initialCents` with `@map` so physical column names remain unchanged. Range: 0–2,147,483,647 cents (€21,474,836.47). Decimal inputs and old stored euro values round half-up to cents; negative/nonfinite/out-of-range historical values stop the migration before conversion.

Splits operate on each payment's integer cents. The owner receives the first remainder cent, followed by accepted recipients sorted by ID. Duplicate/pending recipients do not receive another allocation. Current accepted membership is used, matching the existing app's current-share view; this is not a ledger of historical acceptance changes. Viewer identity selects the correct share. Totals derive from per-payment allocations; formatting converts to euros at UI/email boundaries. Legacy notification money fields are normalized while reading.

## Verified locally

`pnpm test:money` creates old-schema synthetic rows, takes a real `pg_dump` backup, migrates, checks rounded cents in all affected tables, restores with `pg_restore`, verifies original data and rejects an unsafe negative-value migration with rollback. On macOS install the client-only `libpq` tools; Linux CI runs PostgreSQL 17 client tools in Docker. These checks never use production credentials or data.

## Production sequence — not executed

1. Confirm provider/server version, available connections, backup retention and a successful restore into an isolated database. Confirm restored row counts and sums before continuing.
2. Run a read-only reconciliation against the restored copy: counts, monetary ranges, rounding deltas, orphan/duplicate shares and legacy→Contract equivalence. Review every exception. A synthetic fixture does not validate actual production data.
3. Schedule a maintenance window and disable writes/financial reads. This migration changes units in place: old application code cannot run against converted columns.
4. Take a fresh restorable backup, apply the reviewed migration, deploy the matching generated client and code, run owner/recipient/third-user and monetary smoke checks, then restore access.
5. On failure, stop writes and restore the pre-migration backup with the previous application version. Do not divide values blindly: rounding cannot recover original fractional cents. Reconcile any intervening writes before recovery.

Do not retire the legacy tables until actual data reconciliation and rollback rehearsal pass. No production migration, deployment, data equivalence, backup restoration or SSL/pooling verification is claimed by this implementation.
