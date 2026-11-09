# CLAUDE.md

Guidance for Claude Code when working in this repository. The engineering conventions in `AGENTS.md` are binding and are imported here:

@AGENTS.md

## What this is

Expentrac is a Next.js (App Router, webpack) app for tracking recurring loans, subscriptions and income (work contracts), including expenses shared between users. Stack: React 19, Prisma 7 on PostgreSQL (`@prisma/adapter-pg`), NextAuth v4 with Google, TanStack Query + Zustand, Tailwind v4 + shadcn/ui (Radix), React Email + Resend, deployed on Vercel. Node and pnpm versions are pinned in `.nvmrc` and `package.json`.

## Safety first

- `.env.local` points to the **production** database. Never run migrations, seeds, Prisma Studio, cron or maintenance scripts against it. Anything that touches a database during development or testing must go through the disposable-database wrappers below.
- `pnpm prisma:migrate` / `pnpm prisma:studio` refuse to run unless `EXPENTRAC_LOCAL_DATABASE_URL` is exported with a loopback host.
- `migration:*` scripts are production runbooks (see `docs/audits/`). Don't run them as part of implementation work.

## Commands

```sh
pnpm install --frozen-lockfile
pnpm prisma:generate        # client is generated into generated/prisma (gitignored); needed before typecheck/tests
pnpm dev                    # next dev --webpack

pnpm check                  # jest --runInBand + tsc --noEmit + eslint (max-warnings=0): run before every commit
pnpm test -- lib/money.test.ts            # single unit test file
pnpm test -- -t "name of test"            # single test by name
pnpm test:db                # integration tests against a throwaway embedded PostgreSQL (port 55432)
pnpm build                  # prisma generate + next build + scripts/assert-build.cjs
```

Other suites, all run in CI (`.github/workflows/ci.yml`) and all using the disposable database via `scripts/test-database.mjs`: `test:emails`, `test:queries`, `test:legacy`, `test:annual-months`, `test:maintenance`, `test:money`, `test:browser` (Playwright, `tests/browser/`). Which to run: `pnpm check` always; `pnpm test:db` for schema/query/server changes; `pnpm build` for framework, routing or config changes.

Formatting is Prettier: no semicolons, single quotes, no trailing commas.

## Layout

| Path | Purpose |
| --- | --- |
| `app/(web)/` | Public marketing pages and MDX blog (`blog/_posts/*.mdx`) |
| `app/dashboard/` | Authenticated app: loans, subscriptions, providers, notifications, profile |
| `app/api/` | Route handlers; thin wrappers around `lib/server/` |
| `app/api/notification/{cron,outbox}` | Vercel crons (`vercel.json`): daily digest and 5‑minute email retry worker, guarded by `CRON_SECRET` |
| `lib/server/` | Server-only services: auth (`api.ts`), authorized reads (`reads.ts`), validation, invitations, outbox, payment-day logic, schema readiness |
| `lib/` | Shared domain logic: `money.ts` (integer cents), `dates.ts`, `contract.ts` (`LOAN` / `SUBSCRIPTION` / `WORK`), `dto.ts`, `query-policy.ts`, `notification/` |
| `lib/models.ts` | Types safe to import from the browser. `lib/prisma.ts` is `server-only` |
| `sdk/` | Browser HTTP clients built on `sdk/http.ts` (see `sdk/README.md`) |
| `hooks/` | `resources.ts` (domain mutations + invalidation), `search.ts` (debounced search queries) |
| `store/` | Zustand: selected date and UI state only |
| `components/ui/` | shadcn/ui primitives; feature components live in sibling folders |
| `emails/` | React Email templates (`pnpm email` to preview) |
| `prisma/` | `schema.prisma` and migrations |
| `scripts/` | Test harnesses, local Prisma wrapper, production migration/repair tools |
| `docs/audits/` | Runbooks and audit records (money migration, outbox ops, legacy reconciliation, releases) |

Path aliases (`tsconfig.json`): `@lib/*`, `@components/*`, `@emails`, and the catch-all `@*` → repo root.

## How the pieces fit

- **API route pattern.** Handlers are one-liners: `export const GET = (req) => apiResponse(() => readX(req))`. Inside services call `requireUser(req)` from `lib/server/api.ts` to get the session user id (it rejects mismatched `userId` params and checks schema readiness). Throw `ApiError(status, message)` for expected failures; `apiResponse` maps it and Prisma error codes to HTTP responses and passes results through `safeDto`.
- **Data model.** `Contract` (typed by `type`) has `Period`s (fee, payday/paymonth, periodicity), `Share`s with other users, and providers via `ProvidersOnContract`. `Loan`, `Subscription`, `UserProvider` and their share tables are legacy and stay until reconciliation says otherwise. Don't build new features on them.
- **Money.** Stored as integer cents (`*Cents` fields mapped to the old column names). Use the helpers in `lib/money.ts`; splits are deterministic with the owner taking the remainder.
- **Dashboard data flow.** Server layouts prefetch with `lib/server/dashboard-prefetch.ts` and hydrate React Query (`PrivateHydration`). Client refetches and mutations go through `sdk/` and `hooks/resources.ts`. Query keys come from `lib/query-policy.ts` and include the session identity. Render loading and error states with `QueryState` plus the resource's skeleton.
- **Notifications and email.** Financial mutations write the notification and its `EmailOutbox` row in the same serializable transaction. Delivery happens after commit, with retries handled by the outbox cron. Never log recipients or payloads.

## Gotchas

- This Next.js version differs from older training data. Check `node_modules/next/dist/docs/` before using unfamiliar APIs. `next dev` may re-add the agent block in `AGENTS.md`; commit it rather than fighting it.
- Webpack is used explicitly (`--webpack`) for both dev and build.
- Unit tests run under `ts-jest` in a Node environment; `server-only` is stubbed via `tests/server-only.cjs`. Browser specs are excluded from Jest.
- Commit messages use a `:type:` prefix, e.g. `:chore: …`, `:fix: …`.
- `TODO.md` and `Refactor todo.md` are old backlog notes. Current status is in `docs/audits/implementation.md`.
