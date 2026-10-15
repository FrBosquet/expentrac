# Legacy reconciliation and retirement gate

The app uses Contract/Period/Share/ProvidersOnContract/Resource. `/api/loan` and `/api/subscription` are active typed Contract operations, not obsolete legacy-table endpoints. No runtime queries to the old Loan, Subscription, LoanShare, SubscriptionShare or UserProvider models remain. Retain their schema/data until a production restore has been reconciled and recovery rehearsed.

Run on an isolated restored copy using the pinned runtime:

```sh
# Inject EXPENTRAC_MIGRATION_URL securely; no .env files are loaded.
pnpm migration:reconcile
pnpm migration:reconcile --mapping /secure/path/reviewed-mapping.json
```

The script uses a read-only repeatable-read transaction and never imports, updates or deletes rows. It supports old euro or new cent units, rejecting mixed schema types. UTC timestamp decoding matches Prisma DateTime storage. It checks owner, type, name, initial/period amounts, loan date bounds/payday, recipient acceptance, provider roles and links. Different IDs require an explicit reviewed mapping; same-name candidates are suggestions only. Mapping entries have this shape:

```json
[{ "legacyType": "Loan", "legacyId": "old-id", "contractId": "current-id" }]
```

Exit 0 means all checked rows match these comparisons; 2 means reconciliation exceptions/unused mappings; 1 means connection/schema/input failure. Reports contain private record IDs: save them outside the repo with restricted access. Multi-period histories and subscription start dates/yearly months cannot be proven from the legacy schema, so require manual review. Changed current records may legitimately differ from stale legacy snapshots; investigate rather than overwriting current data.

`pnpm test:legacy` proves matching data, explicit remapping, missing mapping, monetary mismatch and acceptance mismatch on disposable synthetic PostgreSQL. It checks that reconciliation leaves legacy rows intact. A passing synthetic fixture does not establish production equivalence or authorize deletion.

Before retiring tables:

1. Inventory restored legacy rows and standalone UserProvider links; reconcile every source row, duplicate, orphan and ownership/acceptance/provider mismatch. Confirm whether historical migration ran and whether current rows evolved afterward.
2. For missing current records, approve an explicit import plan including subscription start dates/yearly months and exact source→target ID mappings. Do not infer those dates or insert duplicates by matching names. Keep imports separate from retirement.
3. Save the reviewed report/mapping and take a restorable pre-retirement backup. Rehearse restore, row counts, owner/recipient access and financial totals against both application versions.
4. Prepare a separate destructive migration only after review. Preserve the dump and mapping for the agreed retention period. Restore the backup with the compatible old application to recover; do not recreate empty tables as a rollback.

No DROP TABLE migration is included because production equivalence and prior migration history are currently unverified. Integer-cent conversion and nonunique read indexes can be deployed while retaining these rows, using the production migration runner and maintenance procedure.
