'use client'

import { useDate } from '@components/date/context'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { getTimeDescription } from '@lib/dates'
import { useState } from 'react'
import { LoanAdd } from '../add'
import { useLoans } from '../context'
import { COLUMN, LoanFee } from '../item'

interface Props {
  className?: string
}

export const LoanSummary = ({ className }: Props) => {
  const { date, month } = useDate()
  const { allLoans } = useLoans()
  const [activeColumn, setActiveColumn] = useState(COLUMN.FEE)

  const ongoingLoans = allLoans.filter((loan) => {
    return loan.time.isOngoing
  })

  const hasLoans = ongoingLoans.length > 0

  return <Card className={className}>
    <CardHeader>
      <CardTitle>Your loan summary</CardTitle>
      <CardDescription>
        {getTimeDescription(date, month, 'loan')}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <header className='flex justify-end gap-2 pb-4 lg:hidden'>
        <Button size='sm' disabled={activeColumn === COLUMN.DATES} variant='secondary' onClick={() => { setActiveColumn(COLUMN.DATES) }}>DATES</Button>
        <Button size='sm' disabled={activeColumn === COLUMN.AMOUNT} variant='secondary' onClick={() => { setActiveColumn(COLUMN.AMOUNT) }}>AMOUNT</Button>
        <Button size='sm' disabled={activeColumn === COLUMN.FEE} variant='secondary' onClick={() => { setActiveColumn(COLUMN.FEE) }}>FEES</Button>
      </header>
      <header className='hidden lg:grid grid-cols-[2rem_1fr_1fr_1fr_1fr] gap-2 pb-4'>
        <p className='uppercase text-xs text-theme-light text-left col-start-2'>name</p>
        <p className='uppercase text-xs text-theme-light text-center'>start/ends</p>
        <p className='uppercase text-xs text-theme-light text-center'>paid/total</p>
        <p className='uppercase text-xs text-theme-light text-right'>fee</p>
      </header>
      {hasLoans
        ? <div className='flex flex-col gap-3'>
          {ongoingLoans.map((loan) => <LoanFee loan={loan} activeColumn={activeColumn} key={loan.id} />)}
        </div>
        : <div className='grid place-content-center gap-2 p-6 text-center'>
          <p className='text-sm text-theme-light'>You have no loans going on in the selected month</p>
        </div>
      }
      <footer className='flex justify-end pt-8'>
        <LoanAdd />
      </footer>
    </CardContent>
  </Card>
}
