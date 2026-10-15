# Technology audit remediation

Updated 2026-10-15. The original [audit](technology-audit.md) is the baseline from 2026-10-13. Code remediation is implemented and verified locally. The audit remains open for deployment-specific scheduling, production data reconciliation/migration, actual provider configuration and destructive legacy retirement. No production database operation, deployment or real email delivery was performed.

## Agreed decisions

- Audit commits begin with `:chore:`; there is no changelog generator in this repository.
- Store money as integer cents, with half-up conversion and deterministic owner-first/recipient-ID remainder allocation.
- WORK is income and is excluded from expense digests. Shared contracts are readable only after acceptance; edits are owner-only.
- Existing development credentials point to production. Tests use synthetic, disposable PostgreSQL and explicit URL overrides. Production execution is a separate release step.

## Audit-item status

| Audit area | Implemented result | Verification / remaining gate |
|---|---|---|
| P0 private reads and user search | Identity from session; forged userId rejected; owner-scoped lists/cursors; bounded pages/search; minimal DTOs and invitation previews | Unit and real-session anonymous/owner/pending/accepted/third-user cases; cursor ownership/type filtering |
| P0 arbitrary email/notification and maintenance HTTP | Public write/maintenance/revalidation routes removed; maintenance is explicit offline tooling | Build manifest and callers checked; no production endpoint probes |
| P0 cron/email | Bearer secret, daily durable ID, metrics-only replies, persistent outbox, conditional leases, bounded retries, queue-only digest production | Repeated authenticated cron, missing secret/key, races, rollback and provider-error regressions; frequent worker schedule still awaits hosting-plan confirmation |
| P0 share authorization | Recipient-only boolean pending→final transition; accepted-only reads; owner-only edits and action controls | Real recipient detail, repeated answer, third-user write denial and cache isolation |
| P0 public revalidation secret | Endpoint/client secret use removed; authenticated mutations invalidate session-scoped queries | Remove obsolete NEXT_PUBLIC_REVALIDATE_SECRET from deployment configuration |
| P1 type/WORK/ack correctness | Contract filter honored; WORK excluded; ack is explicitly optional true/false | Unit/API/cron fixtures include income and expense types |
| P1 mutation validation/reliability | Dates, money, enums, URLs and relations validated; serializable domain + notification + rendered outbox changes; durable sliding-hour invitation limit | Eleven database tests include concurrent bursts and render rollback; deleted shares cannot reset the limit; unchanged recipients are free |
| P1 subscription and carryover editing | Active period selected without rewriting closed history; pause/resume preserved; missing LINK is created safely; billing edits disabled while paused | Browser CRUD and real pause/resume without reload; owner policy checked before mutation validation |
| P1 browser transport | Same-origin cookies, no-store, timeout/abort, HTTP/JSON/envelope validation, encoded IDs, no automatic write retry; nested Date restoration is idempotent | SDK regression tests and real accepted-recipient rendering |
| P1 dashboard state | TanStack Query owns remote resources, per-account clients/keys, mutation invalidation, loading/error/retry boundaries; Zustand retains date state only | Account change/direct navigation/reload/profile/CRUD/browser regressions; profile fetches WORK only |
| P1 precision | INTEGER cent storage in current and retained legacy tables; cent-based splits/payplan totals; old notification money normalized on read | Runtime guards refuse old/partial schemas before financial access; actual conversion, rounding, rejected unsafe data, repeated deployment, real pg_dump/pg_restore of synthetic rows |
| P2 Prisma/DB | Prisma 5→6→7, aligned CLI/client/adapter, generated client outside node_modules, per-process pool cap and development singleton; shared browser types separated | Generate/migrations/transactions/build verified; production TLS/server version/connection budget remain release checks |
| P2 date/job behavior | Europe/Madrid digest date, DST and 29–31 month-end rules; sequential production/delivery; UI payment previews clamp month-end/leap days and honor stored payday | Calendar and browser tests; deployment job volume/backlog/runtime limits need real-environment verification |
| P2 list performance | Pagination plus nonunique owner/recipient/notification and relation indexes | Real synthetic PostgreSQL plans show index access; no production speed claim; see performance.md |
| P2 public bundle/providers/icons | TooltipProvider moved to dashboard; named icon exports; Session/theme retained for actual public consumers; Recharts is dashboard-only | Comparable local fixture measured 21,125 fewer public JS transfer bytes; no production latency claim |
| P2 blog | Metadata parsed independently of MDX; published inventory allowlist, request-memoized content, static pages and explicit 404 | Metadata/traversal tests plus built public page/unknown-slug browser checks |
| P2 dependencies/toolchain | Staged framework/ORM/UI/email upgrades, pinned Node/pnpm, coherent lock, explicit checks/CI, unused dependencies removed | Frozen install; clean archived checkout install/build with fake env and unreachable DB; runtime audit clean; two unpatched development advisories documented |
| P2 docs/config | AGENTS.md, current README/env template/reference, coherent TS/ESLint config, safe local Prisma wrappers and offline scripts | Local command bypass guards and optional payday dry-run/apply/idempotency tested |
| Legacy retirement | Consumers inventoried; read-only equivalence/mapping tool and rollback/retirement procedure provided; all old tables retained | Actual production equivalence is unverified. No DROP TABLE or inferred import is authorized by a synthetic test |

## Current stack and migration evidence

- Node 24.21.0, pnpm 10.20.0; TypeScript 5.9.3, ESLint 10 flat config.
- Next 14.2.35 containment, then 15.5.28/React 19, then Next/MDX/plugin 16.4.1 with React/DOM 19.3.1 and compatible UI peers. Explicit Webpack is retained: the attempted default Turbopack build emitted an empty app-path manifest despite exit 0. A compiled-route guard prevents that silent result. Compiler/Cache Components remain disabled.
- Prisma 6.19.3 intermediate, then CLI/client/adapter 7.10.0. NextAuth remains patched stable v4.24.15 with its v4 adapter; new-user and welcome queuing are atomic.
- Query 5.104.2; Zustand 4 patch then 5.0.15; Recharts 3.10.1; Tailwind/PostCSS integration 4.3.3 with merge 3.7.0; React Email 6.11.1 and Resend 6.33.0; Lucide 1.57.0. Existing copied shadcn components and compatible animation plugin are retained and browser-tested.
- Package/lock files are authoritative. All implementation batches are committed locally with `:chore:`. No push or deployment was made.

## Local verification

- `pnpm check`: 143 Jest regression cases, typecheck and warning-free lint. Eleven database cases are deliberately skipped in the ordinary test run and executed separately.
- `pnpm test:db`: eleven real PostgreSQL tests for transaction atomicity, concurrency, durable keys, daily queuing, OAuth/welcome rollback and rejection of old/partial schemas.
- `pnpm test:browser`: eleven real-session browser/API tests covering policy, public blog/404, profile, shared detail, CRUD, carryover links, historical periods, quotas, protected jobs, pause/resume, themes, chart keyboard tooltip and mobile/dialog layout. No real Google OAuth or email delivery.
- `pnpm test:emails`: nine rendered templates with escaping/CSS checks; light-card screenshot QA reviewed locally.
- `pnpm test:money`: old euro schema → cents, exact counts/totals, repeated deploy without double conversion, backup/restore and unsafe-value rollback.
- `pnpm test:queries`, `test:legacy`, `test:maintenance`: actual synthetic plans, explicit legacy mapping/mismatch checks, loopback command guards and optional Madrid payday backfill.
- `pnpm build`: 35 compiled routes, static public pages and dynamic authenticated routes. A fresh archive of commit fff55e6 also passed frozen install/build without .env.local, node_modules, generated client or Next cache, using fake credentials and an unreachable database URL.
- Final `pnpm audit --prod`: zero reported advisories. Full audit retains unpatched development-only braces/sprintf-js findings; no suppressions. Remote CI has not been run.

## Release gates still open

1. Confirm hosting plan and activate a compatible frequent outbox worker schedule. The protected endpoint and Pro template are prepared; active vercel.json remains once daily. A daily schedule alone cannot provide prompt retries inside the 23-hour cutoff.
2. Restore a real production backup into an isolated database. Run read-only migration inspection and legacy reconciliation, review exceptions/mappings and rehearse recovery. Synthetic equivalence does not prove actual legacy data was migrated.
3. Confirm PostgreSQL provider/server version, direct URL, SSL/certificates, migration permissions and aggregate connection budget. Stop application writes/financial reads and cron during the in-place unit conversion.
4. Use the guarded production runner, deploy the matching app/client, verify Google OAuth/session creation, owner/recipient/third-user behavior, money totals and actual scheduler/provider delivery, then reopen access.
5. Prepare destructive legacy retirement only after real equivalence, explicit import decisions for missing records and backup/restore approval. Preserve the source tables and recovery dump meanwhile.

## Operational references

- [Production migration and rollback](money-migration.md)
- [Legacy reconciliation and retirement](legacy-reconciliation.md)
- [Mutation/delivery guarantees](mutation-reliability.md)
- [Retry worker scheduling](outbox-operations.md)
- [Dependency security status](dependency-security.md)
- [Performance measurements and limits](performance.md)
