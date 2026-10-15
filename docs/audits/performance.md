# Performance checks

These measurements use synthetic data and localhost. They do not predict production latency, cardinality, network transfer or provider connection budgets.

`pnpm test:queries` creates 1,000 users, 40,000 contracts, 100,000 notifications and 40,000 shares in disposable PostgreSQL 17. It drops/recreates only the measured indexes inside a rolled-back fixture transaction, runs `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` and verifies unchanged result counts plus index access. Sample on 2026-10-15:

| Query | Before, ms | After, ms | Before rows discarded | After access |
|---|---:|---:|---:|---|
| Owner contract list | 1.339 | 0.046 | 39,960 | Bitmap index scan |
| Owner notification list | 3.441 | 0.101 | 99,900 | Bitmap index scan |
| Recipient share list | 1.482 | 0.046 | 39,960 | Bitmap index scan |

Single warm-cache samples, not a benchmark distribution. Additional nonunique indexes support period/resource/provider/share relation lookups; they have not been independently benchmarked. The migration retains duplicates and legacy data. Normal index creation needs a maintenance window on large production tables; inspect real plans/cardinality on the restored copy before deployment.

`pnpm test:browser` records a route-metrics JSON attachment with HTML and JavaScript encoded/decoded bytes, script requests, TTFB and API response bytes/counts for public landing/blog, dashboard and profile. Each route uses a fresh browser context, but server/build caches may be warm. API request counts are not SQL query counts. Profile regression asserts that expense resources are not fetched there.

The original Next 14 build reported landing 125 kB, blog 96.5 kB and dashboard 262 kB first-load JavaScript. Next 16's build output does not provide the same estimates, so do not compare them directly with browser transfer bytes or claim improvement from incompatible measurements.

Recharts is imported only by the dashboard forecast, not by the root/public layouts. Root SessionProvider currently supports public sign-in/header state; the theme context controls the body. Any provider removal must preserve those consumers. No public/private caching change or production performance claim is implied by these checks.

Baseline browser sample after the typed WORK-query correction (2026-10-15, before moving TooltipProvider):

| Route | TTFB, ms | Encoded JS bytes | Script requests | API calls | API body bytes |
|---|---:|---:|---:|---:|---:|
| / | 2.3 | 198,585 | 18 | 1 | 133 |
| /blog | 1.5 | 198,826 | 19 | 1 | 133 |
| /dashboard | 6.3 | 369,229 | 23 | 4 | 2,820 |
| /dashboard/profile | 3.7 | 257,039 | 26 | 4 | 1,535 |

These resource totals are recorded after network idle and can include framework prefetches. They are not first-load build estimates. The profile previously fetched all contracts for its WORK section; it now requests `type=WORK` with a separate cache key. The regression checks for unfiltered/expense requests, not merely for a smaller fixture response.

After moving TooltipProvider into the dashboard and narrowing the icon re-export, the same fixture recorded `/` 177,460 encoded JS bytes (16 scripts), `/blog` 177,701 (17), dashboard 368,559 (23) and profile 256,670 (26). Public transfer decreased 21,125 bytes in this sample. TTFB varied within a few milliseconds, which is not evidence of a latency improvement. Session/theme providers remain because public sign-in and body styling consume them. Dashboard keyboard tooltips and theme/dialog checks still pass.
