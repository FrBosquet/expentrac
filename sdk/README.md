# Browser API clients

All dashboard HTTP calls use `sdk/http.ts`: same-origin session cookies, uncached private resources, timeout/cancellation, HTTP errors, JSON/envelope validation and Date restoration. Resource IDs and search terms are URL-encoded. Writes are never automatically retried.

RSC uses authorized `lib/server/` services directly; never import the browser SDK in a server layout. Dashboard query keys include session identity, and mutations invalidate dependent projections.
