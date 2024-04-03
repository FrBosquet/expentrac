import { ProviderLogo } from '@components/provider/ProviderLogo'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import Link from 'next/link'
import { useSubs } from '../context'

interface Props {
  className?: string
}

export const PausedSubs = ({ className }: Props) => {
  const { pausedSubs } = useSubs()

  return <Card className={className}>
    <CardHeader>
      <CardTitle>Paused subscriptions</CardTitle>
    </CardHeader>
    <CardContent>
      <section className='grid grid-cols-5 gap-2 max-h-[500px] overflow-y-auto group'>
        {pausedSubs.map((sub) => {
          return <Link href={`/dashboard/subscriptions/${sub.id}`} className='flex flex-col items-center hover:text-expentrac-800' key={sub.id}>
            <ProviderLogo provider={sub.providers.vendor} />
            <p>{sub.name}</p>
          </Link>
        })}
      </section>
    </CardContent>
  </Card>
}
