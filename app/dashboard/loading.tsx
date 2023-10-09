import { Spinner } from '@components/ui/spinner'

export default function Loading() {
  return <div className="flex-1 flex justify-center items-center bg-theme-back">
    <Spinner className="w-8 h-8 text-theme-front" />
  </div>
}
