'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@components/ui/table"
import { useSubs } from "./Context"
import { SubscriptionAdd } from "./SubscriptionAdd"
import { SubscriptionDelete } from "./SubscriptionDelete"
import { SubscriptionDetail } from "./SubscriptionDetail"
import { SubscriptionEdit } from "./SubscriptionEdit"

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
            <TableHead className="flex-1">Subscription</TableHead>
            <TableHead className="text-right">Monthly fee</TableHead>
            <TableHead className="w-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {subs.map((sub) => {

            return (
              <TableRow key={sub.id}>
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