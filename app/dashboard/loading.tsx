import { Spinner } from '@components/ui/spinner'

export default function Loading() {
  return (
    <div className="col-span-2 flex h-screen flex-1 items-center justify-center bg-theme-back lg:col-span-4">
      <Spinner className="size-8 text-theme-front" />
    </div>
  )
}
