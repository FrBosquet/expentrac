'use client'

import { Button } from '@components/ui/button'
import { type ReactNode } from 'react'

export function QueryState({
  pending,
  error,
  hasData,
  fetching = false,
  retry,
  skeleton,
  children
}: {
  pending: boolean
  error: Error | null
  hasData: boolean
  fetching?: boolean
  retry: () => void
  skeleton: ReactNode
  children: ReactNode
}) {
  if (pending) return skeleton
  return (
    <>
      {error && (
        <div
          role="alert"
          className="col-span-2 rounded-lg border border-red-300 p-4 xl:col-span-4"
        >
          <p>
            {hasData
              ? 'Could not refresh your data. Showing the last loaded data.'
              : error.message}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={fetching}
            onClick={retry}
          >
            Try again
          </Button>
        </div>
      )}
      {fetching && hasData && (
        <p
          role="status"
          className="col-span-2 text-xs text-theme-light xl:col-span-4"
        >
          Refreshing…
        </p>
      )}
      {hasData && children}
    </>
  )
}
