'use client'

import { centsToEuros } from '@lib/money'
import { Button } from '@components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardMenu,
  CardTitle
} from '@components/ui/card'
import { useContracts } from '@hooks/resources'
import { CONTRACT_TYPE } from '@lib/contract'
import { euroFormatter } from '@lib/currency'
import { Contract } from '@lib/models'
import { Provider } from '@lib/models'
import { PlusIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Props {
  className?: string
}

const getLogo = (provider: Provider) => {
  const logos = (provider?.rawContent as any)?.logos as Array<{
    type: string
    formats: Array<{
      src: string
    }>
  }>

  if (!logos) {
    return null
  }

  const logo = logos.find((logo) => logo.type === 'icon')

  if (!logo) return null

  return logo?.formats[0].src
}

const getCurrentPeriod = (contract: Contract) => {
  const currentPeriod = contract.periods.find((period) => {
    return period.to === null
  })

  return currentPeriod
}

const WorkContractRow = ({ contract }: { contract: Contract }) => {
  const provider = contract.providers[0]?.provider
  const image = provider ? getLogo(provider) : null

  const currentPeriod = getCurrentPeriod(contract)

  return (
    <li className="grid grid-cols-[auto_1fr_auto] grid-rows-2 gap-4">
      <div className="relative row-span-2 aspect-square overflow-hidden rounded-md">
        {image && <Image fill alt={provider?.name ?? 'Employer'} src={image} />}
      </div>
      <h2 className="flex-1 font-semibold uppercase">{contract.name}</h2>
      <p className="col-start-2 row-start-2 text-slate-300">
        At {provider?.name ?? 'Unknown employer'}
        {currentPeriod &&
          `, since ${new Date(currentPeriod.from).toLocaleDateString(
            'default',
            {
              month: 'short',
              day: 'numeric',
              year: '2-digit'
            }
          )}`}
      </p>
      <p className="text-expentrac">
        {euroFormatter.format(centsToEuros(currentPeriod?.feeCents ?? 0))}/mo
      </p>
    </li>
  )
}

export const WorkContractSummary = ({ className }: Props) => {
  const query = useContracts()
  const contracts = query.contracts.filter(
    (contract) => contract.type === CONTRACT_TYPE.WORK
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Your work contracts</CardTitle>
        <CardDescription>
          These are the work contracts you have registered
        </CardDescription>
      </CardHeader>
      <CardMenu className="justify-end">
        <Button asChild size="xs" variant="card-menu">
          <Link href="/dashboard/profile/add-contract">
            <PlusIcon size={16} />
            <span>Add</span>
          </Link>
        </Button>
      </CardMenu>
      <CardContent>
        {query.isLoading && <p>Loading...</p>}
        {query.isError && <p>Error: {query.error?.message}</p>}
        {query.isSuccess && contracts.length === 0 && (
          <p>No work contracts yet.</p>
        )}
        {query.isSuccess && (
          <ul>
            {contracts.map((contract) => {
              return (
                <WorkContractRow
                  key={contract.id}
                  contract={contract as Contract}
                />
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
