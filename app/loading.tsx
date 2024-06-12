import { Spinner } from '@components/ui/spinner'

export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Spinner className="size-8" />
    </div>
  )
}
