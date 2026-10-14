# Technology audit implementation

Scope: `technology-audit.md` and its dashboard React Query follow-up. All audit commits use `:chore:`. The changelog generator belongs to another project.

Agreed policy: shared contract reads require acceptance; edits remain owner-only. WORK is excluded from expense digests. Money will move to integer cents with explicit rounding and deterministic splits.

## Verification environment

Development credentials point to production. Do not run migration, seed, maintenance, cron, or API smoke tests against those credentials. `scripts/test-database.mjs` creates disposable localhost PostgreSQL with synthetic data and overrides connection variables. It neither loads nor copies production data.

## Completed batches

- Session identity for private list GETs; reject forged `userId`; direct authorized dashboard reads; contract type filter; owner/accepted-recipient detail access; recipient-only boolean share responses.
- Removed arbitrary HTTP email/notification creation, maintenance GET, public-secret revalidation and browser callers. Maintenance moved to an explicit opt-in offline script.
- Authenticated bounded cron, Madrid calendar and month-end payment rules, WORK excluded, durable daily notification key.
- Atomic notification + rendered email outbox, leased delivery, stable Resend keys and bounded retries. Existing email consumers enqueue and attempt delivery after commit. No raw recipient/payload errors are logged.
- Disposable PostgreSQL applied all 25 migrations. Integration tests confirm notification/outbox commit, rollback on rendering failure and unique delivery keys. Unit tests cover authorization, cron and delivery behavior.

- Patched baseline: Next/MDX/plugin 14.2.35, NextAuth 4.24.15, Node 24.21.0 and pnpm 10.20.0 pinned. Explicit lint/typecheck/tests/build CI; invalid TS config and missing script removed; development Prisma singleton and shared type module. Build passes with fake credentials and no database.
- Baseline Next 14 build output: landing first-load JS 125 kB, blog 96.5 kB, dashboard 262 kB. These are build-reported estimates, not live TTFB measurements.

- Runtime mutation validation and authenticated serializable pause/resume/price actions; provider metadata timeout and validation; consistent transport errors, DTO envelope checks and encoded IDs.
- Dashboard resources moved to session-scoped Query clients and mutation invalidation; Zustand retains only date. Profile/WORK use client queries and mutations; bell is inside provider; loading/error/retry boundaries included.
- Three real-session browser/API tests pass on synthetic localhost data: permissions/filtering, profile + navigation consistency, direct detail/reload/account isolation. Google OAuth itself remains untested.

- Next 15.5.28 / React 19.3.1 stage: async route params and metadata, remote image patterns, current Radix/Query/form/toast peers. Unit tests, typecheck, lint, production build and real-session production-bundle browser checks pass. Next 15 dev served a truncated first-load layout chunk during recompilation; this remains a dev smoke check for the Next 16 stage. The codemod could not transform wrapped route exports; those were migrated manually and checked.

- Next 16.4.1 and ESLint 10.12.0 flat config pass checks, full production build, compiled-route guard and production/dev real-session browser tests. Explicit Webpack is retained: a default Turbopack build emitted an empty app-path manifest despite exit 0. The Next 15 dev hydration failure no longer reproduces on Next 16. Compiler/Cache Components remain disabled.

## Remaining work

- Minimal DTOs and pending-invitation previews; complete API/input/relationship validation and error handling.
- Reproducible Node/pnpm/CI baseline and patched supported framework; Next 14→15→16 / React 19.
- Common browser transport; React Query for all remote dashboard resources; session-scoped cache and mutations.
- Prisma singleton, separate shared types, Prisma 5→6→7.
- Integer-cent schema, conversion/reconciliation/rollback; legacy inventory and gated retirement.
- UI/email/tooling updates, blog metadata/slug handling, bundle and query measurements, indexes/pagination.
- Documentation and operational verification.

## Release requirements

The outbox migration must be applied before deploying code that uses it. Configure a server-only `CRON_SECRET` and verify Vercel sends its bearer header. Remove `NEXT_PUBLIC_REVALIDATE_SECRET` from deployment configuration. Sources: [Vercel cron authentication](https://vercel.com/docs/cron-jobs/manage-cron-jobs), [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys).

Resend deduplicates keys for 24 hours. Automated retries stop after 23 hours from first attempt or five attempts. Failed/uncertain deliveries require reconciliation, not blind replay with a new key. The existing daily cron retries queued work; operators can invoke the authenticated cron inside the retry window. No deployment, production migration, production backup verification, Google OAuth test, live data reconciliation, or real query plan/bundle improvement is claimed.
