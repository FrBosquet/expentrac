# Legacy reconciliation review — 2026-10-15

This follows the initial strict-comparison report from the production release. The 21 reported exceptions were differences or missing historical information, not 21 demonstrated missing migrations. The initial review was read-only against the restored maintenance-window backup. The subsequent owner-confirmed production repair is recorded below.

## Migration provenance established

The historical migration implementation in commit `e961585` preserved legacy Contract IDs, owner IDs, types and creation timestamps. It created subscription Period.from from Subscription.createdAt, because the legacy subscription schema did not store a start date. Later maintenance derived missing paydays from Period.from.

Of 27 source records, 25 have the same ID, owner, expected type and creation timestamp in Contract. These comprise all eight Loans and 17 of 19 Subscriptions. All 17 linked subscriptions retain the migration's expected first-period start date. This is direct evidence that these records were migrated; they should not be imported again.

Six records passed every initial strict comparison. The other 19 linked records include later changes to names, fees, links and billing histories, and informational differences where legacy payday/start/month values were unavailable. Three subscriptions have later billing periods. Period and Contract timestamps distinguish these changes from the frozen legacy snapshots. Current records must not be overwritten merely to make old and new rows equal.

A removed legacy invitation was explicitly declined, so it provides no basis for restoring accepted access or sending another invitation. Provider relations used by linked records match the initial comparisons. There are two legacy provider-library links with no legacy contract references: one is represented on current contracts; the other remains archived in UserProvider. Retain that information while retirement remains undecided.

## Owner decisions and completed repair

The owner confirmed that the two missing-ID subscriptions are historical records to archive. Keep current records; do not recreate charges, infer a replacement mapping or restore invitations. The old source rows and standalone provider-library link remain in the retained legacy tables and private backups as historical archives.

The owner confirmed January for the three open YEARLY periods with missing paymonth, keeping the existing days. The reviewed repair set paymonth to 0 on exactly those three production periods, preserving days 10, 17 and 17 and all fees, dates, relations and other fields except updatedAt. The repair was tested against synthetic fixtures and the restored production backup before execution. The live target identities and original versions were checked, a fresh full production backup was taken, and the row changes were applied together with private before/after snapshots. Independent queries confirmed all three live schedules. The actual payment-day matcher accepts their January dates and rejects February; no emails were sent during verification.

**Reconciliation is complete:** all 27 source records are accounted for (25 migrated identities, two owner-confirmed archived records), and the three annual months are repaired. Current data remains authoritative; strict comparison differences against frozen legacy rows are reviewed historical differences, not instructions to overwrite current records. No imports, access grants or legacy deletions occurred. Retaining the old tables as archives is the chosen disposition; removing them later is optional, separate maintenance requiring an explicit retention/recovery decision.

## Private evidence and recovery

Record IDs, names, dates, comparison details and owner dispositions are saved with the release backups outside Git in `legacy-review-details.json` and `legacy-reviewed-dispositions.json`. The private plan, full pre-repair dump, row snapshots and live verification are `annual-month-plan.json`, `annual-month-before.dump`, `annual-month-production/{before,after}.json` and `annual-month-production-verified.json`. No private customer data is added to this repository.

The repair tooling and recovery considerations are documented in [annual month repair](annual-month-repair.md). It defaults to inspection, refuses stale or conflicting targets and makes no further changes on a repeat run. Do not restore a whole database over later live writes to undo a narrow schedule repair.
