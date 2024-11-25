'use client'

import { useSearchParams } from 'next/navigation'
import { useLayoutEffect } from 'react'
import { toast } from 'sonner'

type Props = {
  errors: Record<string, string>
}

/**
 * Reads the error query parameter and displays a toast with the corresponding error message.
 * @param errors A dictionary of error codes and their corresponding messages.
 * @throws If the error code is not found in the `errors` dictionary.
 */
export const ErrorToaster = ({ errors }: Props) => {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const timeframe = searchParams.get('timeframe')

  useLayoutEffect(() => {
    if (!error) return
    if (errors[error]) {
      toast.error(errors[error])
      return
    }

    toast.error(error)
  }, [timeframe, error, errors])

  return null
}
