import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@components/ui/table"
import { Subscription } from "@prisma/client"
import { SubscriptionDelete } from "./SubscriptionDelete"

type Props = {
  subscriptions: Subscription[]
}

export const SubscriptionSummary = ({ subscriptions }: Props) => {
  return (
    <section className="flex flex-col gap-2 py-4">
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Your subscriptions:</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="flex-1">Subscription</TableHead>
            <TableHead className="text-right">Monthly fee</TableHead>
            <TableHead className="w-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub) => {

            return (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{sub.name} </TableCell>
                <TableCell className="font-semibold text-right">{sub.fee.toFixed(2)}€/m</TableCell>
                <TableCell>
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