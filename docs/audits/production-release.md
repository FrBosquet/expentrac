# Production release — 2026-10-15

Production: https://www.expentrac.app/

Deployed source commit: `d8a5702`. Vercel deployment: `dpl_5b9XviQqi8B1KyFDL3cG5eHbK114`, https://expentrac-814w7domn-fr-bosquet-team.vercel.app/ . Released by CLI with staged production build and explicit promotion; Git commits have not been pushed.

## Completed

- Confirmed the existing linked Vercel Pro project and PostgreSQL 15.19 server. Database client transport uses certificate-validated TLS (`sslmode=verify-full`); backup tooling also uses the system CA bundle. The database proxy reports backend `pg_stat_ssl=false`, while the client stream is encrypted.
- Took a real production snapshot, restored it into isolated localhost PostgreSQL, ran the read-only legacy reconciliation and applied all pending migrations there. Money counts and expected rounded cent totals matched.
- Updated Vercel to Node 24.x, configured certificate-validated database URLs, pool limit 3 per process, and a private production CRON_SECRET. Removed the obsolete NEXT_PUBLIC_REVALIDATE_SECRET production target. No credentials are stored in tracked files or this report.
- Built the release with `--prod --skip-domain`: all 35 compiled routes verified before maintenance.
- Disabled cron; the user confirmed Vercel's interactive traffic pause. Verified `paused=true` and zero other active database transactions before applying.
- The guarded production runner took a fresh private backup, applied all pending migrations, and verified integer types, unchanged monetary row/non-null counts and exact expected cent totals. Contract, Period and retained Loan/Subscription money columns are now INTEGER cents. Independent checks found required outbox/invitation tables and zero failed migrations.
- Promoted the prepared matching application while paused. The user confirmed Vercel's interactive resume; the project API verified `paused=false` and the correct production deployment.
- Re-enabled cron: daily digest at 10:00 UTC, retry worker every five minutes. Scheduler definitions target the new deployment. The automatic outbox invocation at 07:30:35 UTC returned HTTP 200; the observed release logs contain no HTTP 5xx responses.
- Browser smoke: homepage renders and hydrates; anonymous dashboard redirects home and the private contract API returns 401 (verified in runtime logs); Google sign-in reaches Google's login page with the correct production callback. A real authenticated callback/dashboard requires the user's Google login. No synthetic production user or financial record was created.

## Backups and reconciliation

Private backups and reports are outside the repository at `/Users/frbosquet/Projects/expentrac-production-backups/2026-10-15-release/`, with directory mode 0700 and dump/report mode 0600. `rehearsal.dump` was actually restored; `production-cutover/before.dump` is the fresh maintenance-window backup. Preserve these securely and make a durable encrypted off-device copy under the owner's backup policy.

Legacy reconciliation checked 27 records: six matched the scripted comparisons and 21 require review. Exceptions include missing explicit mappings/import decisions, scheduling/history information and changed fields/relations. Reports contain private IDs and remain outside Git. All eight legacy Loans, 19 Subscriptions and 27 standalone provider links were retained; no inferred import or destructive retirement occurred.

## Remaining verification and follow-up

- Complete a real Google callback and owner/recipient dashboard smoke with the user's login. Test actual provider delivery through an intended product action; this release did not manually send emails or trigger the daily digest.
- Continue monitoring worker backlog/failures; the first automatic invocation returned HTTP 200. Actual provider delivery and the daily digest have not been manually triggered.
- Review all 21 legacy reconciliation exceptions before deciding on import or retirement. Do not overwrite evolved current records from stale legacy snapshots.
- Check aggregate connection use under actual concurrency. The per-process cap does not establish total deployment capacity.
- Two unpatched development-only dependency advisories remain documented. Runtime auth initialization emits Node's DEP0169 dependency deprecation warning; observed sign-in requests succeeded. It is not an application request failure and has not been suppressed.
- Implementation commits and this release record remain local until a separately approved Git push.

## Recovery

Money units changed in place. Never roll back only the application to its former euro-reading version. Pause traffic and cron; restore the maintenance-window dump into an empty replacement database, verify counts/totals, and deploy the matching previous application against it. Reconcile any writes made after reopening production before switching. See [migration and recovery procedure](money-migration.md).
