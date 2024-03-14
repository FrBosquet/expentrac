'use client'
import { Spinner } from '@components/ui/spinner'
import { Save } from 'lucide-react'
import { useFormStatus } from 'react-dom'

export const SubmitButton = () => {
  const { pending } = useFormStatus()

  return <button type='submit' aria-disabled={pending}>
    {pending ? <Spinner /> : <Save />}
  </button>
}
