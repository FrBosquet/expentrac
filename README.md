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

Authentication needs `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Database connections use `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`. Email delivery uses `RESEND_KEY`. Vercel cron must send `Authorization: Bearer <CRON_SECRET>` using a server-only `CRON_SECRET`. Do not publish secrets with `NEXT_PUBLIC_`.

Current local development credentials point to production. Use an explicitly selected development database for interactive writes. Migration and database verification use synthetic data in disposable PostgreSQL:

```sh
pnpm check
pnpm test:db
pnpm build
```

`pnpm test:db` creates an isolated loopback database, overrides connection variables, applies migrations, runs integration tests and cleans up. It does not load production data. Embedded PostgreSQL's native packages need their install scripts allowed; `pnpm-workspace.yaml` lists approved packages.

See [engineering conventions](AGENTS.md), [technology audit](docs/audits/technology-audit.md) and [implementation status](docs/audits/implementation.md). Apply reviewed migrations before deploying code that relies on new schema; deployment and production data verification are separate release operations.
