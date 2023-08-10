import { ProviderUnfetched } from "@types"
import { HelpCircle } from "lucide-react"

type Props = {
  provider: ProviderUnfetched
}

export const UnfetchedProvider = ({ provider }: Props) => {
  return <article className="shadow-md border rounded-md p-2 flex flex-col justify-center gap-2 items-center border-b-8 border-b-slate-500">
    <HelpCircle className="w-16 h-16 text-slate-500" />
    <h3 className="text-md whitespace-nowrap overflow-hidden overflow-ellipsis max-w-full text-slate-500">{provider.name}</h3>
  </article>
}