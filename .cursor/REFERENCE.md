# Expentrac — Project Reference

Base reference for the Expentrac codebase. Use this for onboarding, refactors, and navigation.

---

## What is Expentrac?

**Expentrac** is an app to track recurrent expenses: **loans** and **subscriptions**. It supports sharing items with other users, provider/vendor metadata, work contracts, and notifications (including daily digests and share accept/reject flows).

- **Stack**: Next.js 14, React 18, TypeScript, Prisma (PostgreSQL), NextAuth, Vercel
- **Version**: 0.5.0 (from `package.json`)

---

## Repository Layout

```
expentrac/
├── app/                    # Next.js App Router (pages, layouts, API routes)
├── components/             # React components (UI, feature, shared)
├── lib/                    # Server/shared utilities, business logic, Prisma
├── sdk/                    # Frontend-only API client (calls app/api)
├── store/                  # Zustand slices (client state)
├── actions/                # Server actions (e.g. work-contract)
├── emails/                 # React Email templates
├── prisma/                 # Schema + migrations
├── public/                 # Static assets (fonts, etc.)
└── types.ts                # Shared types, enums (NOTIFICATION_TYPE, etc.)
```

---

## Tech Stack Summary

| Area | Technology |
|------|------------|
| Framework | Next.js 14 (App Router) |
| UI | React 18, Radix UI, shadcn/ui (new-york, slate), Tailwind, next-themes (dark mode) |
| Data / DB | Prisma 5, PostgreSQL (Vercel Postgres) |
| Auth | NextAuth 4 |
| State | Zustand (slices: contracts, date, share, notification, provider-on-contract) |
| Data fetching | TanStack React Query (via provider/context) |
| Emails | React Email, Resend |
| Testing | Jest, ts-jest |
| Hosting | Vercel (crons for `/api/notification/cron` daily at 10:00) |

---

## Path Aliases (tsconfig / components.json)

- `@*` → repo root (e.g. `@lib/...`, `@components/...`, `@types`)
- `@components/*` → `./components/*`
- `@emails` → `./emails`
- shadcn: `@components`, utils from `@lib/utils`

---

## App Router Structure

### Public / marketing

- `/` — Landing (e.g. `app/page.tsx`)
- `(web)/` — Blog, pricing, team
  - `blog`, `blog/[slug]`, `pricing`, `team`
- Layout: `app/(web)/layout.tsx`

### Dashboard (authenticated)

- `/dashboard` — Main dashboard
- `/dashboard/loans`, `/dashboard/loans/[id]`
- `/dashboard/subscriptions`, `/dashboard/subscriptions/[id]`
- `/dashboard/providers`
- `/dashboard/notifications`
- `/dashboard/profile`, `/dashboard/profile/edit`, `/dashboard/profile/add-contract`

### API Routes (`app/api/`)

- **Auth**: `auth/[...nextauth]`
- **Resources**: `loan`, `loan/[id]` | `subscription`, `subscription/[id]` | `contract`, `contract/[id]` | `provider`, `provider-on-contract` | `user`
- **Sharing**: `share`, `share/[id]`
- **Notifications**: `notification`, `notification/[id]`, `notification/cron` (Vercel cron)
- **Other**: `email`, `revalidate`, `migrate`

---

## Data Model (Prisma) — Core Entities

- **User** — NextAuth + profile (name, email, occupation). Has loans, subscriptions, notifications, contracts, shares (sent/received), UserProvider links.
- **Loan** — Recurring loan (name, fee, initial, start/end dates). Optional vendor/platform/lender via `UserProvider` (Provider).
- **Subscription** — Recurring sub (name, fee, yearly, payday, link). Optional vendor/platform via `UserProvider`.
- **Provider** — Vendor/platform/lender entity (name, url, logo, colors, brandfetch-style `rawContent`). Many-to-many with User via `UserProvider`.
- **Contract** — Work contract with `Period[]`, `Share[]`, `ProvidersOnContract[]`, `Resource[]`. Used for fee/period tracking.
- **Share** — Contract share between users (from/to, accepted). Similar share concepts exist for Loan (`LoanShare`) and Subscription (`SubscriptionShare`).
- **Notification** — User notification (type, date, payload, ack). Types in `types.ts` (e.g. LOAN_SHARE, SUB_SHARE, DAILY).

Auth models: `Account`, `Session`, `VerificationToken` (NextAuth).

---

## Key Libraries (`lib/`)

- **prisma.ts** — Prisma client singleton
- **auth.ts** — NextAuth config
- **session.ts** — Session handling
- **api.ts** — Base API helpers
- **contract.ts**, **loan.ts**, **sub.ts** — Domain logic for contracts, loans, subscriptions
- **provider.ts** — Provider (vendor/platform) logic
- **notification/** — Notification builders (generic, daily, loan-share, sub-share, accept/reject)
- **brandfetch.ts** — External brand/provider metadata
- **email.tsx** — Email sending/setup
- **dates.ts** — Date utilities (tests in `dates.test.ts`)
- **currency.ts**, **utils.ts**, **tailwind-preset.ts**, **blog.ts**, **mocks.ts`

---

## SDK (frontend only)

- **Rule**: Only frontend imports from `sdk/`; used to call backend API routes.
- **Entry**: `sdk/index.ts` re-exports: `contract`, `loan`, `notifications`, `provider-on-contract`, `subscription`, `user`.
- **Provider**: `sdk/provider.ts` — likely React Query or fetch wrapper for provider/context.

---

## State (Zustand) — `store/`

- **contracts.ts** — Contract list, sort by period start; add/update/remove.
- **date.ts** — Selected date (e.g. for dashboard views).
- **share.ts** — Share-related UI/flow state.
- **notification.ts** — Notification state.
- **provider-on-contract.ts** — Provider–contract association state.

Slices are composed (e.g. `StateCreator<ContractsSlice>`) and likely combined in a single store used by `RootProvider`.

---

## Components Overview

- **Provider** — Root app provider (auth, theme, query client, etc.); `components/Provider/`, `components/provider/`.
- **UI** — shadcn in `components/ui/` (avatar, button, dialog, dropdown, input, navigation-menu, popover, progress, separator, sonner, table, tooltip, etc.).
- **Feature** — `dashboard/`, `hero/`, `loan/`, `subscription/`, `payplan/`, `notifications/`, `share/`, `work-contract/`, `profile/`, `provider/`, etc.
- **Web** — `web/Header.tsx`, `Layout.tsx`, `HamburgerMenu.tsx`.
- **Emails** — Rendered via `emails/*.tsx` (welcome, daily, loan-share, sub-share, accept/reject, generic).

---

## Emails (`emails/`)

- **template.tsx** — Base layout.
- **welcome.tsx**, **daily.tsx** — Onboarding and daily digest.
- **loan-share.tsx**, **loan-share-acceptance.tsx**, **loan-share-rejection.tsx**
- **sub-share.tsx**, **sub-share-acceptance.tsx**, **sub-share-rejection.tsx**
- **generic.tsx** — Generic notification email.

---

## Scripts (`package.json`)

| Script | Purpose |
|--------|--------|
| `dev` | `next dev` |
| `build` | `prisma generate` + `next build` |
| `build:dev` | `next build` only |
| `start` | `next start` |
| `lint` | `next lint` |
| `vercel:env_pull` | Pull Vercel env into `.env.local` |
| `prisma:migrate` | Migrate with `.env.local` |
| `prisma:generate` | Generate client with `.env.local` |
| `prisma:studio` | Prisma Studio |
| `email` | `email dev` (React Email dev) |
| `script` | `ts-node script.ts` |
| `test` | Jest |
| `test:watch` | Jest watch |

---

## Environment / Deployment

- **Env**: Use `.env.local` for local; Vercel env via `vercel link` + `npm run vercel:env_pull`.
- **DB**: `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING` (Prisma datasource).
- **Cron**: `vercel.json` — `/api/notification/cron` at `0 10 * * *` (daily 10:00).
- **Images**: `next.config.js` allows `asset.brandfetch.io` for images.

---

## Conventions & Conventions to Remember

1. **SDK**: All frontend→API calls go through `sdk/`; no direct `fetch` to API routes from random components.
2. **Types**: Shared enums and interfaces live in `types.ts` (e.g. `NOTIFICATION_TYPE`, `SHARE_STATE`, `BrandExtendedInfo`).
3. **Prisma**: Use `@lib/prisma` for Prisma client and generated types.
4. **Refactor todo**: See `Refactor todo.md` (e.g. tests for creating provider and subscription).

---

## Quick Start (from README)

```bash
vercel link
npm run vercel:env_pull
npm i
npm run dev
```

---

*Last updated from repo analysis. Extend this file as the project evolves.*
