# Legacy reconciliation review — 2026-10-15

This follows the initial strict-comparison report from the production release. The 21 reported exceptions were differences or missing historical information, not 21 demonstrated missing migrations. The review was read-only, against the restored maintenance-window backup; production was not modified.

## Migration provenance established

The historical migration implementation in commit `e961585` preserved legacy Contract IDs, owner IDs, types and creation timestamps. It created subscription Period.from from Subscription.createdAt, because the legacy subscription schema did not store a start date. Later maintenance derived missing paydays from Period.from.

Of 27 source records, 25 have the same ID, owner, expected type and creation timestamp in Contract. These comprise all eight Loans and 17 of 19 Subscriptions. All 17 linked subscriptions retain the migration's expected first-period start date. This is direct evidence that these records were migrated; they should not be imported again.

Six records passed every initial strict comparison. The other 19 linked records include later changes to names, fees, links and billing histories, and informational differences where legacy payday/start/month values were unavailable. Three subscriptions have later billing periods. Period and Contract timestamps distinguish these changes from the frozen legacy snapshots. Current records must not be overwritten merely to make old and new rows equal.

A removed legacy invitation was explicitly declined, so it provides no basis for restoring accepted access or sending another invitation. Provider relations used by linked records match the initial comparisons. There are two legacy provider-library links with no legacy contract references: one is represented on current contracts; the other remains archived in UserProvider. Retain that information while retirement remains undecided.

## Concrete unresolved decisions

- Two subscriptions have no same-ID Contract. One has a same-owner/type/name candidate created in 2025; the other has no same-name candidate. A matching name does not prove identity or establish whether an older record was intentionally deleted. The owner has been asked whether to leave these historical records archived or recover one/both. Do not create charges or infer mappings pending that answer.
- Three open YEARLY periods have no paymonth. The old schema has no month to recover. Current UI calculation falls back to January, while paymentDayMatches requires an explicit month and therefore excludes these periods from digests. The owner has been asked for the actual dates or cancellation status. No billing month should be guessed from a database-import timestamp.

The two missing-record decisions and three annual schedules are the actionable follow-up. Migration provenance for 25 records is established, but this does not prove every current financial value is correct or authorize destructive retirement.

## Private evidence and next steps

Record IDs, names, dates, comparison details and dispositions are saved with the release backups outside Git in `legacy-review-details.json` and `legacy-reviewed-dispositions.json`. No private customer data is added to this repository.

After the owner supplies the missing business information, prepare a narrow, idempotent repair if needed, test it against the restored copy and check the current live values before applying. Preserve later production edits. Keep the legacy tables and backups until a separate retirement decision accounts for unresolved records, standalone provider links and recovery retention.
