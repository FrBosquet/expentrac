'use client'

import { ProviderLogo } from '@components/provider/ProviderLogo'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@components/ui/table'
import { euroFormatter } from '@lib/currency'
import { getAccentColor } from '@lib/provider'
import { type SubscriptionComplete } from '@types'
import { User } from 'lucide-react'
import { SubscriptionAdd } from './add'
import { useSubs } from './context'
import { SubscriptionDelete } from './delete'
import { SubscriptionDetail } from './detail'
import { SubscriptionEdit } from './edit'

const FeeContent = ({ sub }: { sub: SubscriptionComplete }) => {
  const { shares, fee } = sub
  const hasShares = shares.length > 0
  const acceptedShares = shares.filter((share) => share.accepted === true)
  const anyShareAcepted = acceptedShares.length > 0

  const holderFee = fee / (acceptedShares.length + 1)

  return <div className="flex items-center justify-end gap-2">
    {hasShares ? <User className={!anyShareAcepted ? 'opacity-20' : ''} size={12} /> : null} {euroFormatter.format(holderFee)}/mo
  </div>
}

export const SubscriptionSummary = () => {
  const { subs } = useSubs()

  if (subs.length === 0) return null

  return (
    <section className="flex flex-col gap-2 pt-8">
      <div className="flex justify-between">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Your subscriptions:</h4>
        <SubscriptionAdd />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14" />
            <TableHead className="flex-1">Subscription</TableHead>
            <TableHead className="text-right">Monthly fee</TableHead>
            <TableHead className="w-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {subs.map((sub) => {
            const accentColor = getAccentColor(sub.vendor?.provider)

            return (
              <TableRow key={sub.id}>
                <TableCell className="border-l-4" style={{
                  borderLeftColor: accentColor
                }}>{
                    <ProviderLogo className="h-8" provider={sub.vendor?.provider} />
                  }</TableCell>
                <TableCell className="font-medium">
                  <SubscriptionDetail sub={sub} />
                </TableCell>
                <TableCell className="font-semibold text-right">
                  <FeeContent sub={sub} />
                </TableCell>
                <TableCell className="flex gap-1">
                  <SubscriptionEdit sub={sub} />
                  <SubscriptionDelete sub={sub} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </section>
  )
}
