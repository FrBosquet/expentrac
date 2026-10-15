# Expentrac

Track recurring loans, subscriptions and income, including shared expenses.

## Development

Use Node from `.nvmrc` and pnpm from `package.json`:

```sh
nvm use
corepack enable
pnpm install --frozen-lockfile
pnpm prisma:generate
pnpm dev
```

Use `.env.example` to prepare local configuration for an explicitly selected development database. Next development can use `.env.development.local` to override the existing `.env.local` production connection without replacing it. Authentication needs `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Connections use `POSTGRES_PRISMA_URL` and direct `POSTGRES_URL_NON_POOLING`. `DB_POOL_MAX` defaults to three connections per process (allowed 1–20); budget total connections across deployment instances. Email delivery uses `RESEND_KEY`; leaving it empty retains queued work without sending. Cron uses server-only `CRON_SECRET`, never a `NEXT_PUBLIC_` value.

Current local development credentials point to production. Use an explicitly selected development database for interactive writes. Migration and database verification use synthetic data in disposable PostgreSQL:

```sh
pnpm check
pnpm test:db
pnpm test:money
pnpm test:legacy
pnpm test:maintenance
pnpm test:queries
pnpm test:emails
pnpm build
pnpm test:browser
```

`pnpm test:db` creates an isolated loopback database, overrides connection variables, applies migrations, runs integration tests and cleans up. It does not load production data. Embedded PostgreSQL's native packages need their install scripts allowed; `pnpm-workspace.yaml` lists approved packages.

`pnpm prisma:migrate` and `pnpm prisma:studio` require an explicitly exported `EXPENTRAC_LOCAL_DATABASE_URL` with a loopback host. They override datasource variables and reject config/URL/schema overrides; they never fall back to `.env.local`. The deployment runner is separate: [production migration and recovery](docs/audits/money-migration.md), [legacy reconciliation](docs/audits/legacy-reconciliation.md) and [retry-worker operation](docs/audits/outbox-operations.md). The production runner defaults to read-only inspection, takes a private backup before applying reviewed migrations, and validates money counts/totals afterward. Production execution is not part of automated verification.

`pnpm migration:paydays` is an optional read-only report of null paydays inferred from each period's Europe/Madrid start date. `--apply` requires explicit target/maintenance/restore attestations. Review the proposal on a restored copy and take a fresh backup first; existing non-null paydays and monetary fields are preserved. It is idempotent and is not required for runtime null-payday fallback.

Backup tests need PostgreSQL client tools: macOS uses client-only Homebrew `libpq`; Linux CI uses the PostgreSQL 17 Docker client. Browser tests use installed Google Chrome on macOS or Playwright Chromium in CI. They use synthetic sessions and disable external email. [Security scan status](docs/audits/dependency-security.md) and [measurement scope](docs/audits/performance.md) document remaining operational limits.

See [engineering conventions](AGENTS.md), [technology audit](docs/audits/technology-audit.md) and [implementation status](docs/audits/implementation.md). Apply reviewed migrations before deploying code that relies on new schema; deployment and production data verification are separate release operations.
