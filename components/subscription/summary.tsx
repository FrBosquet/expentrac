'use client'

import { ProviderLogo } from '@components/provider/ProviderLogo'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@components/ui/table'
import { useUser } from '@components/user/hooks'
import { euroFormatter } from '@lib/currency'
import { getAccentColor } from '@lib/provider'
import { type Subscription } from '@lib/sub'
import { CalendarCheck, User } from 'lucide-react'
import { SubscriptionAdd } from './add'
import { useSubs } from './context'
import { SubscriptionDelete } from './delete'
import { SubscriptionDetail } from './detail'
import { SubscriptionEdit } from './edit'

const FeeContent = ({ sub }: { sub: Subscription }) => {
  const { shares: { isShared, hasAny }, fee: { holder } } = sub
  const hasShares = hasAny
  const holderFee = holder

  return <div className="flex items-center justify-end gap-2">
    {hasShares ? <User className={!isShared ? 'opacity-20' : ''} size={12} /> : null} {euroFormatter.format(holderFee)}/mo
  </div>
}

export const SubscriptionSummary = () => {
  const { ownsAsset } = useUser()
  const { subs } = useSubs()

  const mixedSubs = [
    ...subs
  ]

  if (mixedSubs.length === 0) return null

  return (
    <Card>
      <CardHeader className='flex flex-row justify-between'>
        <CardTitle>Your subscriptions:</CardTitle>
        <SubscriptionAdd />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14" />
              <TableHead className="flex-1">Subscription</TableHead>
              <TableHead>Payment day</TableHead>
              <TableHead className="text-right">Monthly fee</TableHead>
              <TableHead className="w-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {mixedSubs.map((sub) => {
              const accentColor = getAccentColor(sub.providers.vendor)
              const userOwnsSub = ownsAsset(sub)

              return (
                <TableRow key={sub.id}>
                  <TableCell className="border-l-4" style={{
                    borderLeftColor: accentColor
                  }}>
                    {
                      sub.providers.vendor
                        ? <ProviderLogo className="h-8" provider={sub.providers.vendor} />
                        : <CalendarCheck className='h-8 w-8 m-auto' />
                    }
                  </TableCell>
                  <TableCell className="font-medium">
                    <SubscriptionDetail contract={sub.contract} />
                  </TableCell>
                  <TableCell>
                    {sub.time.payday}
                  </TableCell>
                  <TableCell className="font-semibold text-right">
                    <FeeContent sub={sub} />
                  </TableCell>
                  <TableCell className="flex gap-1">
                    {
                      userOwnsSub
                        ? <>
                          <SubscriptionEdit sub={sub} />
                          <SubscriptionDelete sub={sub} />
                        </>
                        : null
                    }
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>

    </Card>
  )
}
