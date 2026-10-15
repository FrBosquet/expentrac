# Expentrac engineering conventions

- Use the Node version in `.nvmrc` and pnpm version in `packageManager`. Commit the pnpm lockfile. CI uses frozen installs.
- Audit remediation commits start with `:chore:`. Commit each coherent change after its relevant checks pass.
- Local development credentials currently point to production. Database tests use `pnpm test:db`, which explicitly overrides URLs and creates disposable localhost PostgreSQL. Do not run migrations, seed scripts, cron or maintenance checks against production during implementation.
- Keep Prisma and authorization on the server. Import browser/shared types from `lib/models.ts`; `lib/prisma.ts` is server-only.
- Browser API access belongs in `sdk/`. RSC calls authorized server services directly. Never accept a caller-provided userId as authority.
- Contract edits are owner-only. Shared contract reads require explicit acceptance. Pending invitations provide a limited preview. WORK is income, never an expense digest item.
- Dashboard remote state belongs in TanStack Query with keys scoped to the session; Zustand is for date/UI state. Move all readers and writers together when migrating a resource.
- Money migration uses integer cents, validated ranges and deterministic splits. Do not combine destructive legacy retirement with dependency updates.
- Keep runtime schema readiness checks before financial access; never write cent values to the former euro schema. Local migration/studio commands require an explicit loopback URL. Production migration/reconciliation tools use an explicit target and default to inspection.
- Persist email work atomically with notification state; send after commit, check provider error responses, and retain bounded idempotent retry state. Do not log recipient addresses, payloads or secrets.
- Run `pnpm check`, `pnpm test:db` for database changes, and `pnpm build` for framework changes. No tests or builds should need production credentials. Report outstanding real OAuth/deployment/data checks honestly.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
