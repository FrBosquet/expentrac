import { Spinner } from '@components/ui/spinner'

export default function Loading () {
  return <div className="h-screen w-screen flex justify-center items-center">
    <Spinner className="w-8 h-8" />
  </div>
}
