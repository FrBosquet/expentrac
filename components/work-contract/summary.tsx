'use client'

import { fetchWorkContracts } from '@actions/work-contract'
import { useDate } from '@components/date/context'
import { useLoans } from '@components/loan/context'
import { COLUMN } from '@components/loan/item'
import { Button } from '@components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardMenu,
  CardTitle
} from '@components/ui/card'
import { euroFormatter } from '@lib/currency'
import { Contract } from '@lib/prisma'
import { Provider } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { PlusIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

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
  const provider = contract.providers[0].provider
  const image = getLogo(provider)

  const currentPeriod = getCurrentPeriod(contract)

  return (
    <li className="grid grid-cols-[auto_1fr_auto] grid-rows-2 gap-4">
      <div className="relative row-span-2 aspect-square overflow-hidden rounded-md">
        {image && <Image fill alt={provider.name} src={image} />}
      </div>
      <h2 className="flex-1 font-semibold uppercase">{contract.name}</h2>
      <p className="col-start-2 row-start-2 text-slate-300">
        At {provider.name}
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
        {euroFormatter.format(currentPeriod?.fee ?? 0)}/mo
      </p>
    </li>
  )
}

export const WorkContractSummary = ({ className }: Props) => {
  const { date, month } = useDate()
  const { allLoans } = useLoans()
  const [activeColumn, setActiveColumn] = useState(COLUMN.FEE)
  const query = useQuery({
    queryKey: ['work-contracts'],
    queryFn: async () => await fetchWorkContracts()
  })

  const ongoingLoans = allLoans.filter((loan) => {
    return loan.time.isOngoing
  })

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
        {query.isError && <p>Error: {query.error.message}</p>}
        {query.isSuccess && (
          <ul>
            {query.data.map((contract) => {
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
