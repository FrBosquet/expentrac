# Reviewed annual billing month repair

`pnpm migration:annual-months --plan /private/path/plan.json` inspects an explicitly supplied `EXPENTRAC_MIGRATION_URL`; it never loads .env files. Each reviewed plan entry contains `periodId`, `contractId`, `expectedPayday`, `expectedUpdatedAt` (UTC ISO timestamp), and `month` (0–11). Plans contain private record IDs and belong outside Git.

To apply, supply `EXPENTRAC_REPAIR_BACKUP_DIR` pointing to a new directory outside the repository and append `--apply`. Rehearse against a restored backup first; take a fresh full backup before production execution. The script also saves private before/after row snapshots. Use its successful exit and independent database verification to establish commit; a failed attempt's reports alone do not prove application.

The repair only fills missing months on reviewed open YEARLY subscription periods. It locks the affected period and contract rows, validates identity/day/version, verifies unchanged financial and other fields, and commits all changes together. Stale versions or existing conflicting months refuse the entire repair. Already-correct months are left alone, making a repeated run idempotent. A five-second lock timeout avoids waiting indefinitely on live edits; no maintenance pause is required for these narrowly scoped row updates.

`pnpm test:annual-months` verifies dry-run behavior, refusal of stale versions without partial updates, protection of existing months, exact updates, private backup permissions, repeat execution and invalid identity/duplicate plans on synthetic localhost PostgreSQL. It does not connect to production.

Recovery must be reviewed against current values: changing a repaired month back to NULL would restore the old incomplete schedule. Use the saved before rows only after accounting for later edits; never restore a full database over live writes merely to undo these three fields.
