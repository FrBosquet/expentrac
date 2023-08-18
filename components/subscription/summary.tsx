'use client'

import { ProviderLogo } from "@components/provider/ProviderLogo"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@components/ui/table"
import { getAccentColor } from "@lib/provider"
import { SubscriptionAdd } from "./add"
import { useSubs } from "./context"
import { SubscriptionDelete } from "./delete"
import { SubscriptionDetail } from "./detail"
import { SubscriptionEdit } from "./edit"

export const SubscriptionSummary = () => {
  const { subs } = useSubs()

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

            return (
              <TableRow key={sub.id}>
                <TableCell className="border-l-4" style={{ borderLeftColor: getAccentColor(sub.vendor?.provider) }}>{
                  <ProviderLogo className="h-8" provider={sub.vendor?.provider} />
                }</TableCell>
                <TableCell className="font-medium">
                  <SubscriptionDetail sub={sub} />
                </TableCell>
                <TableCell className="font-semibold text-right">{sub.fee.toFixed(2)}€/m</TableCell>
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