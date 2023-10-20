import { Spinner } from '@components/ui/spinner'

export default function Loading() {
  return <div className="flex-1 flex justify-center items-center bg-theme-back col-span-2 lg:col-span-4 h-screen">
    <Spinner className="w-8 h-8 text-theme-front" />
  </div>
}
