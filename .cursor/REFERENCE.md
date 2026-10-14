# Expentrac project reference

The current engineering conventions are in [AGENTS.md](../AGENTS.md). Setup and checks are in [README.md](../README.md). Remediation progress and release requirements are in [the implementation tracker](../docs/audits/implementation.md).

- Next.js App Router with PostgreSQL/Prisma, NextAuth and Google authentication.
- Public web/blog use server rendering; dashboard keeps an authenticated server shell and client queries.
- Browser API clients live in `sdk/`; authorized server reads live in `lib/server/`.
- Shared model types are in `lib/models.ts`; the server-only Prisma client is globally cached in development.
- Notification helpers persist notification state and rendered email work together. Delivery runs after commit and through the authenticated cron.
- Current dependency versions and runtime requirements are authoritative in `package.json`, `.nvmrc` and `pnpm-lock.yaml`.
- Legacy Loan/Subscription/UserProvider models remain until data reconciliation proves removal safe.
