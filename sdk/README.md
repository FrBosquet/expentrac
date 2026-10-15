# Browser API clients

All same-origin dashboard HTTP calls use `sdk/http.ts`: same-origin session cookies, uncached private resources, timeout/cancellation, HTTP errors, JSON/envelope validation and Date restoration. Resource IDs and search terms are URL-encoded. Writes are never automatically retried.

RSC uses authorized `lib/server/` services directly; never import the browser SDK in a server layout. Dashboard query keys include session identity, and mutations invalidate dependent projections.

First loads use authorized server readers and React Query hydration, with one server client per request. Browser refetches and writes use these SDK clients; components do not issue HTTP directly. `hooks/resources.ts` exposes domain mutation state and waits for dependent resource invalidations. `hooks/search.ts` owns debounced, cancelable search queries.

All private keys use `lib/query-policy.ts` and session identity. WORK is a projection of the canonical contracts list. `PrivateHydration` drops snapshots from other accounts; the browser client is stable across streamed rendering and cleared on logout or account changes. Use `QueryState` with the resource's skeleton for initial loading, keep cached content during background fetches, and show recoverable errors without removing loaded data.
