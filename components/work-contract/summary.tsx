'use client'

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
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface Props {
  className?: string
}

export const WorkContractSummary = ({ className }: Props) => {
  const { date, month } = useDate()
  const { allLoans } = useLoans()
  const [activeColumn, setActiveColumn] = useState(COLUMN.FEE)

  const ongoingLoans = allLoans.filter((loan) => {
    return loan.time.isOngoing
  })

  const hasLoans = ongoingLoans.length > 0

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
      <CardContent></CardContent>
    </Card>
  )
}
