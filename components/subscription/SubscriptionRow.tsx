import { Subscription } from "@prisma/client"
import { SubscriptionDelete } from "./SubscriptionDelete"

type Props = {
  sub: Subscription
}

export const SubscriptionRow = ({ sub }: Props) => {
  return (
    <article className="p-2 border-b border-primary grid gap-4 grid-cols-[1fr_auto_auto]">
      <p>{sub.name}</p>

      <p className="text-right font-bold">{sub.fee.toFixed(2)}€/m</p>
      <SubscriptionDelete sub={sub} />
    </article>
  )
}